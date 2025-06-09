import path from "path-browserify";

import { OctoprintAPI } from "./OctoprintAPI";

export type Node = {
  name: string;
  display: string;
  size: string; // Size like 10 MB
  path: string;
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

// TODO: Create the whole FileAPI
export class FileAPI extends OctoprintAPI {
  public async printFile(origin: string, filePath: string) {
    const resp = await this.httpClient.post(
      path.join("/api/files", origin, filePath),
      {
        command: "select",
        print: true,
      },
    );
    if (resp.status === 409) {
      throw Error("Printer already printing...");
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
      "sd",
      SDResp.data.files,
    );
    const localFiles: (Node | Dir | Print)[] = this.processFiles(
      "local",
      localResp.data.files,
    );
    if (localResp.status !== 200 || SDResp.status !== 200) {
      return [];
    }

    return [
      {
        display: "SD",
        name: "sdcard",
        size: "",
        path: "/sdcard/",
        children: sdFiles,
      },
      {
        display: "Local",
        name: "local",
        size: "",
        path: "/local/",
        children: localFiles,
      },
    ];
  }

  private processFiles(
    origin: "local" | "sd",
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
          size: String(folder.size),
          children: this.processFiles(origin, folder.children),
        });
      } else if (file.type === "model" || file.type === "machinecode") {
        const print = file as FileInfo;
        tree.push({
          display: print.display,
          name: print.name,
          path: print.path,
          size: String(print.size),
          thumbnail: print.thumbnail
            ? path.join(this.httpClient.defaults.baseURL ?? "", print.thumbnail)
            : "",
        });
      }
    });
    return tree;
  }
}
