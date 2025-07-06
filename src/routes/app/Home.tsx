import { t } from "i18next";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import Actions from "@/components/home/Actions";
import PrinterStatus from "@/components/home/PrinterStatus";

import type { OctoprintState } from "./App";

export default function Home() {
  const octoprintState: OctoprintState = useOutletContext();
  useEffect(() => {
    if (!octoprintState.connectionInfos.connected) {
      toast.error(t("errors.E0001"));
    }
  }, []);
  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <PrinterStatus />
      <Actions />
    </div>
  );
}
