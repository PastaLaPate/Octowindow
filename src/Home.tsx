import { useEffect, useState } from "react";
import { OctoprintNode } from "./lib/octoprint/Octoprint";
import type { Temp } from "./lib/octoprint/apis/PrinterAPI";

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
  useEffect(() => {
    const node = new OctoprintNode();
    node?.printer.addListener("temp", (tool, bed) => {
      setBedTemp(bed);
      setToolTemp(tool);
    });
    setNode(node);
  }, []);

  return (
    <div className="home-container">
      <p>
        {Math.round(toolTemp.current)}/ {Math.round(toolTemp.target)}
      </p>
    </div>
  );
}
