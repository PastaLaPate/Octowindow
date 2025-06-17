import { useEffect, useState } from "react";

import "./App.css";

import { Outlet } from "react-router";

import {
  allFalseFlags,
  type ConnectionInfos,
  type Temp,
} from "@/lib/octoprint/apis/PrinterAPI";
import { OctoprintNode } from "@/lib/octoprint/Octoprint";
import TopBar from "@/components/Topbar";
import { Toaster } from "@/components/ui/sonner";

import { AnimationLayout } from "../PageAnimation";

function App() {
  const [node, setNode] = useState<OctoprintNode>();
  const [bedTemp, setBedTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "bed",
    addTemp(addCelsius) {},
    setTemp(newTemp) {},
  });
  const [toolTemp, setToolTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "tool",
    addTemp(addCelsius) {},
    setTemp(newTemp) {},
  });
  const [connectionInfos, setConnectionInfos] = useState<ConnectionInfos>({
    connected: false,
    printerName: "",
    flags: allFalseFlags,
  });
  useEffect(() => {
    const node = new OctoprintNode();
    node?.printer.addListener("temp", (tool, bed) => {
      setBedTemp(bed);
      setToolTemp(tool);
    });
    node?.printer.addListener("status", (infos) => {
      setConnectionInfos(infos);
    });
    setNode(node);
  }, []);
  return (
    <AnimationLayout>
      <div className="flex h-screen w-screen flex-col bg-slate-950">
        <Toaster position="bottom-left" richColors />
        {node && (
          <TopBar
            octoprintState={{
              node: node,
              bedTemp: bedTemp,
              toolTemp: toolTemp,
              connectionInfos: connectionInfos,
            }}
          />
        )}
        <div className="flex h-full min-h-0 w-screen flex-1">
          <Outlet
            context={{
              node: node,
              bedTemp: bedTemp,
              toolTemp: toolTemp,
              connectionInfos: connectionInfos,
            }}
          />
        </div>
      </div>
    </AnimationLayout>
  );
  /*
  return (
    <div>
      {!isSetupComplete ? (
        <Setup onCompleted={() => setIsSetupComplete(true)} />
      ) : (
        <Home />
      )}
    </div>
  );*/
}

export default App;
