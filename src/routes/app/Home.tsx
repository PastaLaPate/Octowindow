import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { toast } from "sonner";

import {
  type ConnectionInfos,
  type Temp,
} from "@/lib/octoprint/apis/PrinterAPI";
import { OctoprintNode } from "@/lib/octoprint/Octoprint";
import Actions from "@/components/home/Actions";
import PrinterStatus from "@/components/home/PrinterStatus";

export type OctoprintState = {
  node: OctoprintNode;
  bedTemp: Temp;
  toolTemp: Temp;
  connectionInfos: ConnectionInfos;
};

export default function Home() {
  const octoprintState: OctoprintState = useOutletContext();
  useEffect(() => {
    if (!octoprintState.connectionInfos.connected) {
      toast.error("Printer isn't connected !");
    }
  }, []);
  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <PrinterStatus />
      <Actions />
    </div>
  );
}
