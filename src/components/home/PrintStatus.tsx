import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import type { Temp } from "@/lib/octoprint/apis/PrinterAPI";
import { cn } from "@/lib/utils";

import ControlledKeyboard from "@/Keyboard";
import type { OctoprintState } from "@/routes/app/Home";
import ControlledInput from "../ControlledInput";
import HeatedPlate from "../svg/HeatedPlate";
import Nozzle from "../svg/Nozzle";

function TempViewer({
  octoprintState,
  target,
}: {
  octoprintState: OctoprintState;
  target: "tool" | "bed";
}) {
  const [tempInput, setNumberInput] = useState("");
  const [temp, setTemp] = useState<Temp | undefined>(undefined);
  // Close keyboard if click is outside input and keyboard

  useEffect(() => {
    setTemp(
      target === "tool" ? octoprintState.toolTemp : octoprintState.bedTemp,
    );
  }, [octoprintState]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 p-5 px-10">
      {target === "tool" ? (
        <Nozzle stroke={"var(--nozzle-color)"} className="h-24 w-24" />
      ) : (
        <HeatedPlate stroke={"var(--heated-bed-color)"} className="h-24 w-24" />
      )}
      {temp && (
        <ControlledInput
          value={tempInput === "" ? String(temp.current) : tempInput}
          onChange={setNumberInput}
          label={target === "tool" ? "Tool" : "Bed"}
          numeric={true}
          validate={(input) => {
            temp.setTemp(Math.round(Number(input)));
            setNumberInput(" ");
          }}
          inputClassName={cn(
            "text-center",
            target === "tool"
              ? "text-blue-200 font-bold"
              : "text-yellow-200 font-bold",
          )}
          className="flex flex-col items-center justify-center gap-3 text-center"
        />
      )}
      <p className="text-2xl text-slate-500">
        {temp && (temp.target !== 0 ? `${temp.target}` : "")}
      </p>
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
