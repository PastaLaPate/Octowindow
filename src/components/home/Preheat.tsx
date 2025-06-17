import { Plus } from "lucide-react";
import { use, useState } from "react";

import ControlledInput from "../ControlledInput";
import HeatedPlate from "../svg/HeatedPlate";
import Nozzle from "../svg/Nozzle";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from "../ui/drawer";

type PreheatTempProps = {
  label: string;
  icon: "nozzle" | "bed";
  value: number;
  editable?: boolean;
  onChange?: (val: number) => void;
  className?: string;
};

export function PreheatTemp({
  label,
  icon,
  value,
  editable = false,
  onChange,
  className = "",
}: PreheatTempProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg bg-slate-800 px-2 py-1 sm:px-4 sm:py-2 ${className}`}
    >
      <span className="flex items-center gap-1 sm:gap-2">
        {icon === "nozzle" ? (
          <Nozzle
            stroke="var(--nozzle-color)"
            className="h-5 w-5 sm:h-7 sm:w-7"
          />
        ) : (
          <HeatedPlate
            stroke="var(--heated-bed-color)"
            className="h-5 w-5 sm:h-7 sm:w-7"
          />
        )}
        <span className="text-xs font-semibold text-white sm:text-base">
          {label}
        </span>
      </span>
      {editable && onChange ? (
        <ControlledInput
          value={String(value)}
          onChange={(v) => {
            const n = Number(v.replace(/\D/g, ""));
            if (!isNaN(n)) onChange(n);
          }}
          numeric
          inputClassName="text-base font-bold text-blue-200 sm:text-lg w-14 text-center ml-3 p-0 px-2"
          className="w-16"
          placeholder="0"
        />
      ) : (
        <span
          className={`text-base font-bold ${
            icon === "nozzle" ? "text-blue-200" : "text-yellow-200"
          } sm:text-lg`}
        >
          {value}°C
        </span>
      )}
    </div>
  );
}

function TempPreset({
  name = "Name",
  initBedTemp = 60,
  initToolTemp = 200,
  onSelected = () => {},
  create = false,
}: {
  name?: string;
  initBedTemp?: number;
  initToolTemp?: number;
  onSelected?: () => void;
  create?: boolean;
}) {
  const [startingCreating, setStartingCreating] = useState<boolean>(true);
  const [bedTemp, setBedTemp] = useState(initBedTemp);
  const [toolTemp, setToolTemp] = useState(initToolTemp);

  return (
    <div
      onClick={() => {
        if (startingCreating && create) {
          setStartingCreating(false);
        } else {
          onSelected();
        }
      }}
      className={
        "group flex h-[280px] max-w-[180px] min-w-[140px] flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:border-blue-500 focus:outline-none active:scale-100 sm:max-w-[220px] sm:min-w-[180px] sm:gap-4 sm:p-5"
      }
    >
      {!create || !startingCreating ? (
        <>
          <p className="text-base font-bold text-blue-400 transition group-hover:text-blue-300 sm:text-xl">
            {name}
          </p>
          <div className="flex w-full flex-col gap-1 sm:gap-2">
            <PreheatTemp
              label="Nozzle"
              icon="nozzle"
              value={toolTemp}
              editable={!startingCreating}
              onChange={setToolTemp}
            />
            <PreheatTemp
              label="Bed"
              icon="bed"
              value={bedTemp}
              editable={!startingCreating}
              onChange={setBedTemp}
            />
          </div>
          <span className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-1 text-sm font-bold text-white shadow transition group-hover:bg-blue-700 sm:mt-4 sm:text-lg">
            {create ? "Create" : "Select"}
          </span>
        </>
      ) : (
        startingCreating && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-20 w-20 items-center">
              <Plus className="h-full w-full" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function PreHeat({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (x: boolean) => void;
}) {
  return (
    <Drawer open={opened} onClose={() => setOpened(false)}>
      <DrawerPortal>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">
              Select a temp preset or create one.
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex w-full items-center justify-center gap-4 overflow-x-auto py-4">
            <TempPreset name="PLA" initBedTemp={60} initToolTemp={200} />
            <TempPreset create={true} />
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
