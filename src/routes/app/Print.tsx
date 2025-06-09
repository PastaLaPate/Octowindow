import { useNavigate, useOutletContext } from "react-router";
import type { OctoprintState } from "./Home";
import { ArrowLeft, ArrowRight, Image, Printer, Trash } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Dir, Node, Print } from "@/lib/octoprint/apis/FileAPI";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type ViewType = "list" | "gallery";

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
}: {
  print?: Print;
  viewType: ViewType;
  depth?: number;
}) {
  return viewType == "gallery" ? (
    <div></div>
  ) : (
    <CListNode depth={depth}>
      <img src={print.thumbnail} width={40} height={40} />
      <p>{print.display}</p>
      <p>·</p>
      <p className="text-sm text-slate-400">{print.path}</p>
      <div className="ml-auto flex h-10 flex-row items-center gap-6">
        <Trash className="h-8 w-8" />
        <Image className="h-8 w-8" />
        <Printer className="h-8 w-8" />
      </div>
    </CListNode>
  );
}

function Directory({
  dir,
  viewType,
  depth = 0,
}: {
  dir: Dir;
  viewType: ViewType;
  depth?: number;
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
  return (
    <div
      className={cn(
        "flex w-full gap-2 overflow-y-auto",
        viewType == "gallery" ? "flex-row flex-wrap" : "flex-col",
      )}
    >
      {Array(3).fill(<Print3D viewType={viewType} />)}
      <Directory
        dir={{
          name: "some_shits",
          path: "/local/some_shits",
          size: "10 MB",
          children: [
            { name: "aled", path: "/local/some_shits/aled", size: "10MB" },
          ],
        }}
        viewType={viewType}
      />
    </div>
  );
}

export default function Print() {
  const [viewType, setViewType] = useState<ViewType>("list");
  const OctoprintState = useOutletContext() as OctoprintState;
  const navigate = useNavigate();
  return (
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
  );
}
