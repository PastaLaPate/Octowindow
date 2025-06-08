import Nozzle from "./svg/Nozzle";
import HeatedPlate from "./svg/HeatedPlate";
import type { OctoprintState } from "@/routes/app/Home";

type TopBarProps = {
  octoprintState: OctoprintState;
};

export default function TopBar({ octoprintState }: TopBarProps) {
  //h-[5%]
  return (
    <div className="sm:h-10 md:h-14 bg-gray-800 relative flex items-center justify-between">
      <div className="flex flex-row items-center">
        {octoprintState.toolTemp.current !== 0 && (
          <>
            <div className="w-8 h-8 sm:w-12 sm:h-12 sm:p-2 md:w-16 md:h-16 md:pt-4 md:pb-4 flex  items-center justify-center">
              <Nozzle stroke="#FFFFFF" className="w-full h-full" />
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
            <div className="w-8 h-8 sm:w-12 sm:h-12 sm:p-2 md:w-16 md:h-16 md:pt-4 md:pb-4 flex  items-center justify-center">
              <HeatedPlate stroke="#FFFFFF" className="w-full h-full" />
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
      <h2 className="w-max absolute left-1/2 -translate-x-1/2 text-center">
        OctoWindow
      </h2>
      <div className="flex flex-row items-center gap-2">
        <p>
          {octoprintState.connectionInfos.connected
            ? octoprintState.connectionInfos.printerName
            : "Disconnected"}
        </p>
        <div
          className={`w-2.5 h-2.5 rounded-full mr-4 ${
            octoprintState.connectionInfos.connected
              ? "bg-green-500"
              : "bg-red-600"
          }`}
        />
      </div>
    </div>
  );
}
