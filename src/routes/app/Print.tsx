import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Image, Printer, Trash } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ref } from "process";

import type { Dir, Print } from "@/lib/octoprint/apis/FileAPI";
import { cn } from "@/lib/utils";

import type { OctoprintState } from "./Home";

type ViewType = "list" | "gallery";

// TODO: Add Gallery view type

function CListNode({
  depth = 0,
  children,
}: {
  depth?: number;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl bg-slate-800 p-4 text-xl",
      )}
      style={{ marginLeft: depth * 20 }}
    >
      {children}
    </div>
  );
}

function Print3D({
  print = {
    name: "benchy.gcode",
    display: "Benchy",
    path: "/local/benchy.gcode",
    size: "10 MB",
    thumbnail:
      "https://images.cults3d.com/HdTHHlECkxM5ANNhheoivtg90to=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/133/illustration-file/1428782343-8151-3672/_4___3DBenchy__Default_view.png",
  },
  viewType,
  depth = 0,
  onTrash = () => {},
  onShowThumbnail = () => {},
  onPrint = () => {},
}: {
  print?: Print;
  viewType: ViewType;
  depth?: number;
  onTrash?: () => void;
  onShowThumbnail?: () => void;
  onPrint?: () => void;
}) {
  return viewType == "gallery" ? (
    <div></div>
  ) : (
    <CListNode depth={depth}>
      <img alt="thumbnail" src={print.thumbnail} width={40} height={40} />
      <p>{print.display}</p>
      <p>·</p>
      <p className="text-sm text-slate-400">{print.path}</p>
      <p>·</p>
      <p className="text-sm text-slate-400">{print.size}</p>
      <div className="ml-auto flex h-10 flex-row items-center gap-6">
        <Trash onClick={onTrash} className="h-8 w-8" />
        <Image onClick={onShowThumbnail} className="h-8 w-8" />
        <Printer onClick={onPrint} className="h-8 w-8" />
      </div>
    </CListNode>
  );
}

function Directory({
  dir,
  viewType,
  depth = 0,
  onPrint = () => {},
}: {
  dir: Dir;
  viewType: ViewType;
  depth?: number;
  onPrint?: (print: Print) => void;
}) {
  const [opened, setOpened] = useState(false);
  return viewType == "gallery" ? (
    <div></div>
  ) : (
    <div
      className={cn("flex flex-col gap-2")}
      style={{ marginLeft: depth * 20 }}
    >
      <CListNode>
        <div className="flex h-10 items-center">
          <ArrowRight
            className={cn(
              "h-8 w-8 transition-transform",
              opened ? "rotate-90" : "rotate-0",
            )}
            onClick={() => setOpened(!opened)}
          />
        </div>
        <p>{dir.name}</p>
      </CListNode>
      <AnimatePresence initial={false}>
        {opened && (
          <motion.div
            key="children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="gap-2 flex flex-col"
          >
            {dir.children.map((node) => {
              if ("children" in node) {
                return (
                  <Directory
                    key={node.path}
                    dir={node as Dir}
                    viewType={viewType}
                    depth={depth + 1}
                  />
                );
              } else {
                return (
                  <Print3D
                    key={node.path}
                    print={node as Print}
                    viewType={viewType}
                    depth={depth + 1}
                    onPrint={() => onPrint(node as Print)}
                  />
                );
              }
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function FileViewer({
  octoprintState,
  viewType,
}: {
  octoprintState: OctoprintState;
  viewType: ViewType;
}) {
  const [files, setFiles] = useState<Dir[]>([]);

  const refresh = async () => {
    setFiles(await octoprintState.node.file.getAllFiles());
  };

  useEffect(() => {
    refresh();
    0;
  }, []);

  return (
    <div
      className={cn(
        "flex w-full gap-2 overflow-y-auto",
        viewType == "gallery" ? "flex-row flex-wrap" : "flex-col",
      )}
    >
      {files.map((dir) => {
        return (
          <Directory dir={dir} viewType={viewType} key={dir.name} depth={0} />
        );
      })}
      {/*
      {Array(3).fill(<Print3D viewType={viewType} />)}
      
      <Directory
        dir={{
          name: "some_shits",
          display: "some_shits",
          path: "/local/some_shits",
          size: "10 MB",
          children: [
            {
              display: "some_shits",
              name: "some_shits",
              path: "/local/some_shits",
              size: "10 MB",
              children: Array.from({ length: 3 }, () => ({
                display: "Alex",
                name: "aled.gcode",
                path: "/local/some_shits/aled.gcode",
                size: "10MB",
              })),
            },
            ...Array.from({ length: 3 }, () => ({
              display: "Aled",
              name: "aled.gcode",
              path: "/local/some_shits/aled.gcode",
              size: "10MB",
            })),
          ],
        }}
        viewType={viewType}
      />
      {Array(3).fill(<Print3D viewType={viewType} />)}*/}
    </div>
  );
}

export default function PrintPage() {
  const [viewType, setViewType] = useState<ViewType>("list");
  const OctoprintState = useOutletContext() as OctoprintState;
  const navigate = useNavigate();
  return OctoprintState.node !== undefined ? (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-4 rounded-2xl bg-slate-900 p-10">
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-slate-800 transition hover:bg-slate-700">
            <ArrowLeft
              className="h-10 w-10"
              onClick={() => {
                navigate("/app/");
              }}
            />
          </div>
          <p className="text-4xl font-bold">Select a file</p>
        </div>
        <FileViewer octoprintState={OctoprintState} viewType={viewType} />
      </div>
    </div>
  ) : (
    <></>
  );
}
