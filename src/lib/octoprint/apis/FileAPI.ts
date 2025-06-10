import path from "path-browserify";
import urlJoin from "url-join";

import { OctoprintAPI } from "./OctoprintAPI";

export type Node = {
  name: string;
  display: string;
  size: string; // Size like 10 MB
  path: string;
  origin: "local" | "sdcard";
};

export type Dir = Node & {
  children: (Node | Print | Dir)[];
};

export type Print = Node & {
  thumbnail: string; // Thumbnail URL
};

type FilesInformation = {
  name: string;
  display: string;
  path: string;
  type: "model" | "machinecode" | "folder";
  typePath: string[];
  user: string;
};

type FolderInfo = FilesInformation & {
  children: FilesInformation[];
  size: number;
};

type References = {
  resource: string;
  download: string;
  model: string;
};

type PrintHistory = {
  success: number;
  failure: number;
  last: {
    date: number;
    printTime: number;
    success: boolean;
  };
};

type PrintStatistics = {
  averagePrintTime: Map<string, number>; // Map<PrinterProfileName, time in s>
  lastPrintTime: Map<string, number>; // Map<PrinterProfileName, time in s>
};

type FileInfo = FilesInformation & {
  hash: string;
  size: number;
  date: number;
  origin: "local" | "sdcard";
  refs: References;
  prints: PrintHistory;
  statistics: PrintStatistics;
  thumbnail?: string;
};

function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

// TODO: Create the whole FileAPI
export class FileAPI extends OctoprintAPI {
  public async printFile(origin: string, filePath: string) {
    const resp = await this.httpClient.post(
      urlJoin("/api/files", origin, filePath),
      {
        command: "select",
        print: true,
      },
    );
    if (resp.status === 409) {
      throw Error("Printer already printing or isn't connected...");
    }
  }

  public async getAllFiles(): Promise<Dir[]> {
    const localResp = await this.httpClient.get("/api/files/local", {
      params: {
        recursive: true,
      },
    });
    const SDResp = await this.httpClient.get("/api/files/sdcard", {
      params: {
        recursive: true,
      },
    });
    const sdFiles: (Node | Dir | Print)[] = this.processFiles(
      "sdcard",
      JSON.parse(SDResp.data).files,
    );
    const localFiles: (Node | Dir | Print)[] = this.processFiles(
      "local",
      JSON.parse(localResp.data).files,
    );
    if (localResp.status !== 200 || SDResp.status !== 200) {
      return [];
    }

    return [
      {
        display: "SD",
        name: "sdcard",
        size: "",
        origin: "sdcard",
        path: "/sdcard/",
        children: sdFiles,
      },
      {
        display: "Local",
        name: "local",
        origin: "local",
        size: "",
        path: "/local/",
        children: localFiles,
      },
    ];
  }

  private processFiles(
    origin: "local" | "sdcard",
    files: FilesInformation[],
  ): (Node | Dir | Print)[] {
    const tree: (Node | Dir | Print)[] = [];
    files.forEach((file) => {
      if (file.type === "folder") {
        const folder = file as FolderInfo;
        tree.push({
          name: folder.name,
          display: folder.display,
          path: folder.path,
          size: humanFileSize(folder.size, true, 2),
          children: this.processFiles(origin, folder.children),
          origin: origin,
        });
      } else if (file.type === "model" || file.type === "machinecode") {
        const print = file as FileInfo;
        tree.push({
          display: print.display,
          name: print.name,
          path: print.path,
          size: humanFileSize(print.size, true, 2),
          origin: origin,
          thumbnail: print.thumbnail
            ? new URL(
                print.thumbnail,
                this.httpClient.defaults.baseURL ?? undefined,
              ).toString()
            : "https://images.cults3d.com/HdTHHlECkxM5ANNhheoivtg90to=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/133/illustration-file/1428782343-8151-3672/_4___3DBenchy__Default_view.png",
        });
      }
    });
    return tree;
  }
}
