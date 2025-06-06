import { useEffect, useState } from "react";
import { OctoprintNode } from "./lib/octoprint/Octoprint";
import {
  allFalseFlags,
  type ConnectionInfos,
  type Temp,
} from "./lib/octoprint/apis/PrinterAPI";

export default function Home() {
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
    <div className="home-container">
      <p>
        {Math.round(toolTemp.current)}/ {Math.round(toolTemp.target)}
      </p>
      <p>{connectionInfos.connected ? connectionInfos.printerName : ""}</p>
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          connectionInfos.connected ? "bg-green-500" : "bg-red-600"
        }`}
      />
    </div>
  );
}
