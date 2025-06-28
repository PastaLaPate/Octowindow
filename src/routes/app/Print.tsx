import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Image, Printer, RefreshCw, Trash } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import type { Dir, Print } from "@/lib/octoprint/apis/FileAPI";
import type { FilamentSpool } from "@/lib/octoprint/apis/SpoolManager";
import { cn } from "@/lib/utils";
import BackButton from "@/components/backButton";
import StartPrintDialog from "@/components/StartPrintDialog";
import { Skeleton } from "@/components/ui/skeleton";

import type { OctoprintState } from "./Home";

type ViewType = "list" | "gallery";

// TODO: Add Gallery view type
// NOTE: gallery view type will certainly not be implemented because I have no idea how to do it

function CListNode({
  depth = 0,
  onClick = () => {},
  children,
}: {
  depth?: number;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        "flex items-center gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-lg transition hover:scale-[102%] hover:border-blue-500 active:scale-100 sm:gap-4 sm:p-2"
      }
      style={{ marginLeft: depth * 20, minWidth: 0 }}
      onClick={onClick}
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
    origin: "local",
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
    <div className={"flex flex-col gap-2"} style={{ marginLeft: depth * 20 }}>
      <CListNode onClick={() => setOpened(!opened)}>
        <div className="flex h-10 items-center">
          <ArrowRight className={cn("h-8 w-8 transition-transform", opened ? "rotate-90" : "rotate-0")} />
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
            className="flex flex-col gap-2 px-4 pt-3"
          >
            {dir.children.map((node) => {
              if ("children" in node) {
                return <Directory key={node.path} dir={node as Dir} viewType={viewType} depth={depth + 1} />;
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
  files,
  viewType,
  loading,
}: {
  octoprintState: OctoprintState;
  files: Dir[];
  viewType: ViewType;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full gap-2 overflow-y-auto p-10",
        viewType == "gallery" ? "flex-row flex-wrap" : "flex-col"
      )}
    >
      {!loading
        ? files.map((dir) => {
            return (
              <Directory
                dir={dir}
                viewType={viewType}
                key={dir.name}
                depth={0}
                onPrint={(print) => {
                  octoprintState.node.file.printFile(dir.origin, print.path).catch((e) => {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  });
                }}
              />
            );
          })
        : Array.from({ length: 3 }, () => <Skeleton className="h-20" />)}
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
  const [files, setFiles] = useState<Dir[]>([]);
  const [loading, setLoading] = useState(true);
  const [spools, setSpools] = useState<FilamentSpool[]>([]);
  const refresh = async () => {
    setLoading(true);
    if (OctoprintState.node !== undefined) {
      setFiles(await OctoprintState.node.file.getAllFiles());
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    (async () => {
      setSpools(await OctoprintState.node.spools.getSpools());
    })();
  }, [OctoprintState.node]);
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <BackButton title="Print (File viewer)">
          <div
            className={cn(
              "absolute right-1 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800",
              loading ? "animate-spin" : ""
            )}
            onClick={() => {
              if (!loading) {
                refresh();
              }
            }}
          >
            <RefreshCw className="h-8 w-8" />
          </div>
        </BackButton>
        <FileViewer octoprintState={OctoprintState} files={files} viewType={viewType} loading={loading} />
        <StartPrintDialog
          file={{
            display: "Random file",
            name: "random_file.gcode",
            origin: "local",
            path: "/local/random_file.gcode",
            size: "1000000",
            thumbnail: "https://alexprojects.ovh/favicon.ico",
          }}
          spools={spools}
        />
      </div>
    </div>
  );
}
