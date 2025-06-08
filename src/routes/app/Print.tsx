import { useOutletContext } from "react-router";
import type { OctoprintState } from "./Home";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Print } from "@/lib/octoprint/apis/PrinterAPI";
import { cn } from "@/lib/utils";

type ViewType = "list" | "gallery";

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
}: {
  print?: Print;
  viewType: ViewType;
}) {
  return viewType == "gallery" ? (
    <div></div>
  ) : (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-gray-700 p-4 text-xl">
      <p>{print.display}</p>
      <p>{print.path}</p>
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
        "flex w-full gap-2",
        viewType == "gallery" ? "flex-row flex-wrap" : "flex-col",
      )}
    >
      {Array(10).fill(<Print3D viewType={viewType} />)}
    </div>
  );
}

export default function Print() {
  const [viewType, setViewType] = useState<ViewType>("list");
  const OctoprintState = useOutletContext() as OctoprintState;
  return (
    <div className="flex h-full w-screen items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-4 rounded-2xl bg-gray-800 p-10">
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 transition hover:bg-gray-600">
            <ArrowLeft className="h-10 w-10" />
          </div>
          <p className="text-4xl font-bold">Select a file</p>
        </div>
        <FileViewer octoprintState={OctoprintState} viewType={viewType} />
      </div>
    </div>
  );
}
