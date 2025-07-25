import type { ClassValue } from "clsx";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import type { Temp } from "@/lib/octoprint/apis/PrinterAPI";
import type { PrinterTarget } from "@/lib/octoprint/Octoprint";
import { cn, getTargetLabel } from "@/lib/utils";

import type { OctoprintState } from "@/routes/app/App";
import ControlledInput from "../ControlledInput";
import HeatedPlate from "../svg/HeatedPlate";
import Nozzle from "../svg/Nozzle";

export function TempViewer({
  octoprintState,
  target,
  className,
  inputClassName,
  iconClassName,
}: {
  octoprintState: OctoprintState;
  target: PrinterTarget;
  className?: ClassValue;
  inputClassName?: ClassValue;
  iconClassName?: ClassValue;
}) {
  const [tempInput, setNumberInput] = useState("");
  const [temp, setTemp] = useState<Temp | undefined>(undefined);

  useEffect(() => {
    setTemp(
      target === "tool" ? octoprintState.toolTemp : octoprintState.bedTemp
    );
  }, [octoprintState]);

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-2 !px-0 shadow-lg transition hover:border-blue-500 active:scale-100 sm:gap-3 sm:p-2 md:p-5",
        className
      )}
      style={{
        minWidth: 0,
      }} // Responsive width
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center sm:h-20 sm:w-20 md:h-24 md:w-24",
          iconClassName
        )}
      >
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
          placeholder={String(Math.round(temp.current))}
          value={tempInput}
          standAlonePlaceholder={true}
          onChange={setNumberInput}
          label={getTargetLabel(target)}
          numeric={true}
          validate={(input, setIsKeyboardVisible) => {
            const resp = temp.setTemp(Math.round(Number(input)));
            Promise.resolve(resp)
              .then(() => {
                toast.success(
                  t("toast_messages.temp_set.success", {
                    target: getTargetLabel(target),
                    temp: Number(input),
                  })
                );
              })
              .catch((e) => {
                toast.error(
                  t("toast_messages.temp_set.failure", {
                    target: getTargetLabel(target),
                    temp: Number(input),
                  })
                );
              });
            setNumberInput("");
            setIsKeyboardVisible(false);
          }}
          inputClassName={cn(
            "text-center w-20 sm:w-28 sm:text-4xl xl:w-50 2xl:w-80 lg:text-5xl",
            target === "tool"
              ? "text-blue-200 font-bold"
              : "text-yellow-200 font-bold",
            inputClassName
          )}
          className="flex flex-col items-center justify-center gap-2 text-center"
        />
      )}
      <p className="text-lg text-slate-500 sm:text-xl">
        {temp && (temp.target !== 0 ? `${temp.target}` : "")}
      </p>
      <div
        className={cn(
          "absolute bottom-0 h-2 w-full rounded-b-2xl",
          target === "tool" ? "bg-blue-500" : "bg-yellow-500"
        )}
      />
    </div>
  );
}
export default function PrinterStatus() {
  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex h-full w-[50vw] items-center justify-center gap-3 p-5">
      <TempViewer octoprintState={octoprintState} target="tool" />
      <TempViewer octoprintState={octoprintState} target="bed" />
    </div>
  );
}
