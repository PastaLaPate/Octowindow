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
      <div className="flex w-[50vw] items-center justify-center gap-6">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-4">
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:scale-105 hover:border-blue-500 focus:outline-none active:scale-100">
              <div className="relative sm:h-40 sm:w-40 md:h-52 md:w-52 lg:h-60 lg:w-60">
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
              <div className="relative sm:h-40 sm:w-20 md:h-52 md:w-32 lg:h-60 lg:w-40">
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
          <div className="relative mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg">
            <h2 className="mb-2 text-base font-bold text-blue-400">Step in mm</h2>
            <Tabs defaultValue="10" value={step} onValueChange={setStep}>
              <TabsList>
                <TabsTrigger className="w-10" value="1">
                  1
                </TabsTrigger>
                <TabsTrigger className="w-10" value="5">
                  5
                </TabsTrigger>
                <TabsTrigger className="w-10" value="10">
                  10
                </TabsTrigger>
                <TabsTrigger className="w-10" value="50">
                  50
                </TabsTrigger>
                <TabsTrigger className="w-10" value="100">
                  100
                </TabsTrigger>
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
      <div className="flex w-[50vw] flex-row items-center justify-center gap-6">
        <div>
          <div className="relative flex h-60 w-60 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg">
            <div
              className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center"
              onClick={() => printer.tool.extrude(-Number(step))}
            >
              <p className="text-base font-bold text-blue-400">Intrude</p>
              <ChevronUp size={50} />
            </div>
            <Nozzle
              className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2"
              stroke="var(--color-blue-400)"
            />
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center"
              onClick={() => printer.tool.extrude(Number(step))}
            >
              <ChevronDown size={50} />
              <p className="text-base font-bold text-blue-400">Extrude</p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg">
            <h2 className="mb-2 text-base font-bold text-blue-400">Amount</h2>
            <Tabs defaultValue="10" value={step} onValueChange={setStep}>
              <TabsList>
                <TabsTrigger className="w-10" value="1">
                  1
                </TabsTrigger>
                <TabsTrigger className="w-10" value="5">
                  5
                </TabsTrigger>
                <TabsTrigger className="w-10" value="10">
                  10
                </TabsTrigger>
                <TabsTrigger className="w-10" value="50">
                  50
                </TabsTrigger>
                <TabsTrigger className="w-10" value="100">
                  100
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="flex-col items-center justify-center">
          <TempViewer
            className={"mb-6 w-60"}
            inputClassName={"!w-25 !text-2xl"}
            octoprintState={OctoprintState}
            target="tool"
          />
          <TempViewer
            className={"w-60"}
            inputClassName={"!w-25 !text-2xl"}
            octoprintState={OctoprintState}
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
      <div className="mt-5 mr-auto ml-4">
        <BackButton title="Control" />
      </div>
      <div className="flex h-full min-h-0 flex-1 flex-row">
        <JogPanel />
        <GeneralControlPanel />
      </div>
    </div>
  );
}
