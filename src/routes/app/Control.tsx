import { useOutletContext } from "react-router";

import type { OctoprintState } from "./Home";

export default function Control() {
  const OctoprintState: OctoprintState = useOutletContext();
  // Animated tabs required for choosing move amount (1mm, 5mm, 10mm)
  return <div className="flex min-h-0 flex-1 flex-row"></div>;
}
