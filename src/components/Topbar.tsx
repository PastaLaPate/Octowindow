import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ClassNameValue } from "tailwind-merge";

import type { LocalBackendStatus } from "@/lib/octoprint/apis/OctoWindowAPI";
import { cn } from "@/lib/utils";

import type { OctoprintState } from "@/routes/app/Home";
import HeatedPlate from "./svg/HeatedPlate";
import Nozzle from "./svg/Nozzle";

type TopBarProps = {
  octoprintState: OctoprintState;
};

type GlobalStatus = {
  color: ClassNameValue;
  message: string;
};

export default function TopBar({ octoprintState }: TopBarProps) {
  //h-[5%]
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<LocalBackendStatus>({
    connected: false,
    message: "Checking backend status...",
  });
  const [globalStatus, setGlobalStatus] = useState<GlobalStatus>({
    color: "bg-gray-500",
    message: "Checking global status...",
  });

  useEffect(() => {
    const fetchBackendStatus = async () => {
      const response = await octoprintState.node.local.getBackendStatus();
      setBackendStatus(response);
      setLoading(false);
    };

    fetchBackendStatus();
  }, [octoprintState.connectionInfos]);

  useEffect(() => {
    let color = "bg-green-500";
    let message = "";
    if (
      !backendStatus.connected &&
      octoprintState.connectionInfos.connected === false
    ) {
      color = "bg-red-600";
      message = "Backend is not connected and printer is disconnected.";
      setGlobalStatus({
        color,
        message,
      });
      return;
    } else if (
      !backendStatus.connected ||
      octoprintState.connectionInfos.connected === false
    ) {
      color = "bg-orange-400";
    }
    if (!backendStatus.connected) {
      message = backendStatus.message;
    } else if (octoprintState.connectionInfos.connected === false) {
      message = "No printer connected.";
    } else {
      message = `Connected to ${octoprintState.connectionInfos.printerName}`;
    }
    setGlobalStatus({
      color,
      message,
    });
  }, [backendStatus, octoprintState.connectionInfos]);
  return (
    <div className="relative flex items-center justify-between bg-slate-800 sm:h-10 md:h-20">
      <div className="flex flex-row items-center">
        {octoprintState.toolTemp.current !== 0 && (
          <>
            <div className="flex h-8 w-8 items-center justify-center sm:h-12 sm:w-12 sm:p-2 md:h-16 md:w-16 md:pt-4 md:pb-4">
              <Nozzle stroke="#FFFFFF" className="h-full w-full" />
            </div>
            <p className="text-lg">
              {String(Math.round(octoprintState.toolTemp.current)) +
                (octoprintState.toolTemp.target !== 0
                  ? `/${octoprintState.toolTemp.target}`
                  : "")}
            </p>
          </>
        )}
        {octoprintState.bedTemp.current !== 0 && (
          <>
            <div className="flex h-8 w-8 items-center justify-center sm:h-12 sm:w-12 sm:p-2 md:h-16 md:w-16 md:pt-4 md:pb-4">
              <HeatedPlate stroke="#FFFFFF" className="h-full w-full" />
            </div>
            <p className="text-lg">
              {String(Math.round(octoprintState.toolTemp.current)) +
                (octoprintState.toolTemp.target !== 0
                  ? `/${octoprintState.toolTemp.target}`
                  : "")}
            </p>
          </>
        )}
      </div>
      <h2 className="absolute left-1/2 w-max -translate-x-1/2 text-center">
        OctoWindow ({octoprintState.node.local.version})
      </h2>
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg bg-slate-700 hover:cursor-pointer md:h-8 md:w-8 md:rounded-md lg:h-12 lg:w-12"
          onClick={async () => {
            setLoading(true);
            setGlobalStatus({
              color: "bg-gray-500",
              message: "Refreshing status and trying to connect to printer...",
            });
            try {
              const response =
                await octoprintState.node.local.getBackendStatus();
              setBackendStatus(response);
              await octoprintState.node.printer.connectPrinter();
            } catch (error) {
              toast.error("Failed to refresh status or connect to printer.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <RefreshCw
            className={cn(
              "md:h-6 md:w-6 lg:h-8 lg:w-8",
              loading ? "animate-spin" : "",
            )}
          />
        </div>
        <p>{globalStatus.message}</p>
        <div
          className={`mr-4 h-2.5 w-2.5 rounded-full ${globalStatus.color}`}
        />
      </div>
    </div>
  );
}
