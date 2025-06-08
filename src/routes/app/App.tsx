import { useEffect, useState } from "react";
import "./App.css";
import { OctoprintNode } from "../../lib/octoprint/Octoprint";
import {
  allFalseFlags,
  type ConnectionInfos,
  type Temp,
} from "@/lib/octoprint/apis/PrinterAPI";
import TopBar from "@/components/Topbar";
import { Outlet } from "react-router";

function App() {
  const [node, setNode] = useState<OctoprintNode>();
  const [bedTemp, setBedTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "bed",
  });
  const [toolTemp, setToolTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "tool",
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
    <div className="flex h-screen w-screen flex-col bg-gray-900">
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
      <Outlet
        context={{
          node: node,
          bedTemp: bedTemp,
          toolTemp: toolTemp,
          connectionInfos: connectionInfos,
        }}
      />
    </div>
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
