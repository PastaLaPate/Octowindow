import { useEffect, useState } from "react";
import { OctoprintNode } from "./lib/octoprint/Octoprint";

export default function Home() {
  const [node, setNode] = useState<OctoprintNode>(new OctoprintNode());
  return <div className="home-container"></div>;
}
