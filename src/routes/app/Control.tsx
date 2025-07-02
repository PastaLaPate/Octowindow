import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Home } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import type { MovementAxis } from "@/lib/octoprint/apis/MovementAPI";
import BackButton from "@/components/backButton";
import { TempViewer } from "@/components/home/PrinterStatus";
import Nozzle from "@/components/svg/Nozzle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/animated-tabs";

import type { OctoprintState } from "./Home";

function JogPanel() {
  const OctoprintState: OctoprintState = useOutletContext();
  const [step, setStep] = useState("10");
  const move = OctoprintState.node ? OctoprintState.node.printer.move : undefined;

  const handleMove = (axis: MovementAxis, reverse = false) => {
    move?.jogPrintHead(axis, reverse ? -Number(step) : Number(step));
  };

  return (
    move && (
      <div className="flex w-[50vw] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3 lg:gap-6">
          <div className="flex items-center justify-center sm:gap-2 md:gap-3 lg:gap-4">
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:scale-105 hover:border-blue-500 focus:outline-none active:scale-100">
              <div className="relative sm:h-40 sm:w-40 md:h-40 md:w-40 lg:h-60 lg:w-60">
                <ChevronUp
                  size={50}
                  className="absolute top-0 left-1/2 -translate-x-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("y")}
                />
                <ChevronDown
                  size={50}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("y", true)}
                />
                <ChevronRight
                  size={50}
                  className="absolute top-1/2 right-0 -translate-y-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("x")}
                />
                <ChevronLeft
                  size={50}
                  className="absolute top-1/2 left-0 -translate-y-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("x", true)}
                />
                <Home
                  size={50}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => move.homeAxis(["x", "y"])}
                />
              </div>
              <p className="mt-2 text-base font-bold text-blue-400">X/Y Axes</p>
            </div>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:scale-105 hover:border-blue-500 focus:outline-none active:scale-100">
              <div className="relative sm:h-40 sm:w-20 md:h-40 md:w-20 lg:h-60 lg:w-40">

                <ChevronUp
                  size={50}
                  className="absolute top-0 left-1/2 -translate-x-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("z")}
                />
                <Home
                  size={50}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => move.homeAxis(["z"])}
                />
                <ChevronDown
                  size={50}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 transition hover:scale-115 active:scale-90"
                  onClick={() => handleMove("z", true)}
                />
              </div>
              <p className="mt-2 text-base font-bold text-blue-400">Z Axis</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg">
            <h2 className="mb-2 text-base font-bold text-blue-400">Step in mm</h2>
            <Tabs defaultValue="10" value={step} onValueChange={setStep}>
              <TabsList>
                {["1", "5", "10", "50", "100"].map((v) => {
                  return (
                    <TabsTrigger className="w-10" value={v}>
                      {v}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    )
  );
}

function GeneralControlPanel() {
  const OctoprintState: OctoprintState = useOutletContext();
  const [step, setStep] = useState("10");
  const printer = OctoprintState.node ? OctoprintState.node.printer : undefined;
  return (
    printer && (
      <div className="flex w-[50vw] flex-col items-center justify-center gap-6 md:gap-3">
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="flex items-center justify-between rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg md:h-24 md:w-46 md:flex-row lg:h-60 lg:w-60 lg:flex-col">
            <div
              className="flex flex-col items-center justify-center"
              onClick={() => printer.tool.extrude(-Number(step))}
            >
              <p className="text-base font-bold text-blue-400 md:text-sm lg:text-base">Intrude</p>
              <ChevronUp className="md:size-10 md:-rotate-90 lg:rotate-0" />
            </div>
            <Nozzle className="md:h-14 md:w-14 lg:h-16 lg:w-16" stroke="var(--color-blue-400)" />
            <div
              className="flex items-center justify-center md:flex-col-reverse lg:flex-col"
              onClick={() => printer.tool.extrude(Number(step))}
            >
              <ChevronDown className="md:size-10 md:-rotate-90 lg:rotate-0" />
              <p className="text-base font-bold text-blue-400 md:text-sm lg:text-base">Extrude</p>
            </div>
          </div>

          <div className="relative flex h-24 flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg md:w-46 lg:w-full">
            <h2 className="mb-2 text-base font-bold text-blue-400">Amount</h2>
            <Tabs defaultValue="10" value={step} onValueChange={setStep}>
              <TabsList>
                {["1", "5", "10", "50", "100"].map((v) => {
                  return (
                    <TabsTrigger className="w-10 md:w-7 lg:w-10" value={v}>
                      {" "}
                      {v}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-4">
          <TempViewer
            className={"md:h-46 md:w-34 lg:h-60 lg:w-60"}
            inputClassName={"w-25 md:w-20 xl:w-30 2xl:w-30 md:text-lg lg:text-2xl"}
            iconClassName={"md:w-10 md:h-10"}
            octoprintState={OctoprintState}
            target="tool"
          />
          <TempViewer
            className={"md:h-46 md:w-34 lg:h-60 lg:w-60"}
            inputClassName={"w-25 md:w-20 xl:w-30 2xl:w-30 md:text-lg lg:text-2xl "}
            octoprintState={OctoprintState}
            iconClassName={"md:w-10 md:h-10 "}
            target="bed"
          />
        </div>
      </div>
    )
  );
}

export default function Control() {
  const navigate = useNavigate();
  // Animated tabs required for choosing move amount (1mm, 5mm, 10mm)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mt-5 ml-4">
        <BackButton title="Control" />
      </div>
      <div className="flex h-full min-h-0 flex-1 flex-row">
        <JogPanel />
        <GeneralControlPanel />
      </div>
    </div>
  );
}
