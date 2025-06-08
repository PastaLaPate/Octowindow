import { OctoprintNode } from "@/lib/octoprint/Octoprint";
import {
  type ConnectionInfos,
  type Temp,
} from "@/lib/octoprint/apis/PrinterAPI";
import Actions from "@/components/home/Actions";
import PrintStatus from "@/components/home/PrintStatus";

export type OctoprintState = {
  node: OctoprintNode;
  bedTemp: Temp;
  toolTemp: Temp;
  connectionInfos: ConnectionInfos;
};

export default function Home() {
  return (
    <div className="flex flex-row flex-1 min-h-0">
      <PrintStatus />
      <Actions />
    </div>
  );
}
