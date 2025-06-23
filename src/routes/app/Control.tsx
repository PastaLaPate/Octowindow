import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
} from "lucide-react";
import { useOutletContext } from "react-router";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/animated-tabs";

import type { OctoprintState } from "./Home";

function JogPanel() {
  const OctoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex w-[50vw] items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative h-60 w-60 md:h-52 md:w-52">
          <ChevronUp
            size={50}
            className="absolute top-0 left-1/2 -translate-x-1/2"
          />
          <ChevronDown
            size={50}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          />
          <ChevronLeft
            size={50}
            className="absolute top-1/2 left-0 -translate-y-1/2"
          />
          <ChevronRight
            size={50}
            className="absolute top-1/2 right-0 -translate-y-1/2"
          />
          <Home
            size={50}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <h2 className="text-2xl">Step in mm</h2>
        <Tabs defaultValue="10">
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
  );
}

export default function Control() {
  // Animated tabs required for choosing move amount (1mm, 5mm, 10mm)
  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <JogPanel />
    </div>
  );
}
