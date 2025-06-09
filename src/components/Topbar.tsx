import Nozzle from "./svg/Nozzle";
import HeatedPlate from "./svg/HeatedPlate";
import type { OctoprintState } from "@/routes/app/Home";

type TopBarProps = {
  octoprintState: OctoprintState;
};

export default function TopBar({ octoprintState }: TopBarProps) {
  //h-[5%]
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
        OctoWindow
      </h2>
      <div className="flex flex-row items-center gap-2">
        <p>
          {octoprintState.connectionInfos.connected
            ? octoprintState.connectionInfos.printerName
            : "Disconnected"}
        </p>
        <div
          className={`mr-4 h-2.5 w-2.5 rounded-full ${
            octoprintState.connectionInfos.connected
              ? "bg-green-500"
              : "bg-red-600"
          }`}
        />
      </div>
    </div>
  );
}
