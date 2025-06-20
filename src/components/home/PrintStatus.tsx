import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { toast } from "sonner";

import type { Temp } from "@/lib/octoprint/apis/PrinterAPI";
import { cn } from "@/lib/utils";
import ControlledKeyboard from "@/components/Keyboard";

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

  useEffect(() => {
    setTemp(
      target === "tool" ? octoprintState.toolTemp : octoprintState.bedTemp,
    );
  }, [octoprintState]);

  return (
    <div
      className={cn(
        "sm:gap-3sm:p-2 relative flex flex-1 flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-2 !px-0 shadow-lg transition hover:border-blue-500 active:scale-100 sm:p-2 md:p-5",
        "min-w-0",
      )}
      style={{
        minWidth: 0,
      }} // Responsive width
    >
      <div className="flex h-14 w-14 items-center justify-center sm:h-20 sm:w-20 md:h-24 md:w-24">
        {target === "tool" ? (
          <Nozzle stroke={"var(--nozzle-color)"} className="h-full w-full" />
        ) : (
          <HeatedPlate
            stroke={"var(--heated-bed-color)"}
            className="h-full w-full"
          />
        )}
      </div>
      {temp && (
        <ControlledInput
          placeholder={String(temp.current)}
          value={tempInput}
          standAlonePlaceholder={true}
          onChange={setNumberInput}
          label={target === "tool" ? "Tool" : "Bed"}
          numeric={true}
          validate={(input, setIsKeyboardVisible) => {
            toast.success(`Set ${target}'s temp to ${Number(input)}°C`);
            temp.setTemp(Math.round(Number(input)));
            setNumberInput("");
            setIsKeyboardVisible(false);
          }}
          inputClassName={cn(
            "text-center w-20 sm:w-28 sm:text-4xl lg:w-80 lg:text-5xl",
            target === "tool"
              ? "text-blue-200 font-bold"
              : "text-yellow-200 font-bold",
          )}
          className="flex flex-col items-center justify-center gap-2 text-center"
        />
      )}
      <p className="text-lg text-slate-500 sm:text-xl">
        {temp && (temp.target !== 0 ? `${temp.target}` : "")}
      </p>
      {/* Optional: bottom colored bar for accent */}
      <div
        className={cn(
          "absolute bottom-0 h-2 w-full rounded-b-2xl",
          target === "tool" ? "bg-blue-500" : "bg-yellow-500",
        )}
      />
    </div>
  );
}
export default function PrintStatus() {
  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex h-full w-[50vw] items-center justify-center gap-3 p-5">
      <TempViewer octoprintState={octoprintState} target="tool" />
      <TempViewer octoprintState={octoprintState} target="bed" />
    </div>
  );
}
