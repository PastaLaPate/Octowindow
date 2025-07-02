import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Image, Printer, RefreshCw, Trash } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import type { Dir, Print } from "@/lib/octoprint/apis/FileAPI";
import type { FilamentSpool } from "@/lib/octoprint/apis/SpoolManager";
import { cn } from "@/lib/utils";
import BackButton from "@/components/backButton";
import StartPrintDialog from "@/components/print/StartPrintDialog";
import ThumbnailPreviewer from "@/components/print/ThumbnailPreviewer";
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
        "flex items-center gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-lg transition hover:scale-[102%] hover:border-blue-500 active:scale-100 sm:gap-2 sm:p-2 md:text-sm lg:gap-4 lg:text-base"
      }
      style={{ marginLeft: depth * 10, minWidth: 0 }}
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
      <p className="w-auto">{print.display}</p>
      <p>·</p>
      <p className="text-sm text-slate-400">{print.size}</p>
      <div className="mr-2 ml-auto flex h-10 flex-row items-center md:gap-3 lg:gap-6">
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
  onTrash = () => {},
  onShowThumbnail = () => {},
}: {
  dir: Dir;
  viewType: ViewType;
  depth?: number;
  onPrint?: (print: Print) => void;
  onTrash?: (print: Print) => void;
  onShowThumbnail?: (print: Print) => void;
}) {
  const [opened, setOpened] = useState(false);
  return viewType == "gallery" ? (
    <div></div>
  ) : (
    <div className={"flex flex-col gap-2"} style={{ marginLeft: depth * 20 }}>
      <CListNode onClick={() => setOpened(!opened)}>
        <div className="flex h-10 items-center">
          <ArrowRight
            className={cn(
              "h-8 w-8 transition-transform",
              opened ? "rotate-90" : "rotate-0"
            )}
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
            className="flex flex-col gap-2 px-4 pt-3"
          >
            {dir.children.map((node) => {
              if ("children" in node) {
                return (
                  <Directory
                    key={node.path}
                    dir={node as Dir}
                    viewType={viewType}
                    depth={depth + 1}
                    onPrint={onPrint}
                    onShowThumbnail={onShowThumbnail}
                    onTrash={onTrash}
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
                    onShowThumbnail={() => onShowThumbnail(node as Print)}
                    onTrash={() => onTrash(node as Print)}
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
  spools,
  refresh = () => {},
}: {
  octoprintState: OctoprintState;
  files: Dir[];
  spools: FilamentSpool[];
  viewType: ViewType;
  loading: boolean;
  refresh?: () => void;
}) {
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [thumbnailPreviewerOpen, setThumbnailPreviewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Print | undefined>();
  return (
    <div
      className={cn(
        "relative h-full w-full",
        viewType == "gallery" ? "flex-row flex-wrap" : "flex-col"
      )}
    >
      <div
        key={"gradient"}
        className="absolute top-0 z-10 h-8 w-full bg-gradient-to-b from-slate-900 to-transparent to-90%"
      />
      <div className="flex h-4/5 w-full flex-col gap-2 overflow-y-auto p-3">
        {!loading
          ? files.map((dir) => {
              return (
                <Directory
                  dir={dir}
                  viewType={viewType}
                  key={dir.name}
                  depth={0}
                  onPrint={(print) => {
                    setStartDialogOpen(true);
                    setSelectedFile(print);
                  }}
                  onShowThumbnail={(print) => {
                    setThumbnailPreviewerOpen(true);
                    setSelectedFile(print);
                  }}
                  onTrash={(print) => {
                    (async () => {
                      try {
                        await octoprintState.node.file.deleteFile(print);
                        refresh();
                        toast.success(
                          print.display + " was successfully deleted."
                        );
                      } catch (e) {
                        if (e instanceof Error) {
                          toast.error(e.message);
                        }
                      }
                    })();
                  }}
                />
              );
            })
          : Array.from({ length: 3 }, (x, k) => (
              <Skeleton className="h-20" key={k} />
            ))}
        {selectedFile && (
          <StartPrintDialog
            file={selectedFile}
            open={startDialogOpen}
            setOpen={setStartDialogOpen}
            spools={spools}
            onPrint={async (spool) => {
              if (selectedFile) {
                await octoprintState.node.file.loadFile(
                  selectedFile.origin,
                  selectedFile.path
                );
                await octoprintState.node.spools.selectSpool(spool);
                await octoprintState.node.job.startJob();
              }
            }}
          />
        )}
        {selectedFile && (
          <ThumbnailPreviewer
            file={selectedFile}
            open={thumbnailPreviewerOpen}
            setOpen={setThumbnailPreviewerOpen}
          />
        )}
      </div>
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
      if (OctoprintState.node)
        setSpools(await OctoprintState.node.spools.getSpools());
    })();
  }, [OctoprintState.node]);
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start rounded-2xl bg-slate-900 md:gap-4 md:p-6 lg:gap-8 lg:p-10">
        <BackButton title="Print (File viewer)">
          <div
            className={cn(
              "absolute right-1 flex items-center justify-center rounded-full bg-slate-800 md:size-10 lg:size-14",
              loading ? "animate-spin" : ""
            )}
            onClick={() => {
              if (!loading) {
                refresh();
              }
            }}
          >
            <RefreshCw className="md:size-6 lg:size-10" />
          </div>
        </BackButton>
        <FileViewer
          octoprintState={OctoprintState}
          files={files}
          spools={spools}
          viewType={viewType}
          loading={loading}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
