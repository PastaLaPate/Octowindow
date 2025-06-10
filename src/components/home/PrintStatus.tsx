import { ArrowDown, ArrowUp } from "lucide-react";
import { useOutletContext } from "react-router";

import type { OctoprintState } from "@/routes/app/Home";
import HeatedPlate from "../svg/HeatedPlate";
import Nozzle from "../svg/Nozzle";

function TempViewer({
  octoprintState,
  target,
}: {
  octoprintState: OctoprintState;
  target: "tool" | "bed";
}) {
  const temp =
    target === "tool" ? octoprintState.toolTemp : octoprintState.bedTemp;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 p-5 px-10">
      {target === "tool" ? (
        <Nozzle stroke={"#FFFFFF"} className="h-24 w-24" />
      ) : (
        <HeatedPlate stroke={"#FFFFFF"} className="h-24 w-24" />
      )}
      <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-800">
        <ArrowUp />
      </div>
      <p className="text-3xl">
        {Math.round(temp.current)}
        {temp.target !== 0 ? `/${temp.target}` : ""}
      </p>
      <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-800">
        <ArrowDown />
      </div>
    </div>
  );
}

export default function PrintStatus() {
  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex h-full w-[50vw] items-center justify-center gap-5">
      <TempViewer octoprintState={octoprintState} target="tool" />
      <TempViewer octoprintState={octoprintState} target="bed" />
    </div>
  );
}
