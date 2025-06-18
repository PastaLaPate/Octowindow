import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

import { StoreManager, type TTempPreset } from "@/lib/octoprint/Octoprint";

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

class PresetsManager {
  private storeManager: StoreManager;
  private updateListeners: (() => void)[] = [];

  constructor() {
    this.storeManager = new StoreManager();
  }

  addUpdateListener(listener: () => void): void {
    this.updateListeners.push(listener);
  }

  getTempPresets(): TTempPreset[] {
    // Also clears empty presets
    return (this.storeManager.store.tempPresets || []).filter(
      (preset) =>
        preset.name &&
        preset.bedTemp &&
        preset.toolTemp &&
        preset.id !== undefined,
    );
  }

  addTempPreset(preset: TTempPreset): void {
    const presets = this.getTempPresets();
    preset.id = presets.length;
    presets.push(preset);
    this.storeManager.store.tempPresets = presets;
    this.storeManager.saveStore();
    this.updateListeners.forEach((listener) => listener());
  }

  // Edits preset by name, if it exists
  editTempPreset(preset: TTempPreset): void {
    const presets = this.getTempPresets();
    const index = presets.findIndex((p) => p.name === preset.name);
    if (index !== -1) {
      presets[index] = preset;
      this.storeManager.store.tempPresets = presets;
      this.storeManager.saveStore();
    } else {
      console.warn(`Preset with name ${preset.name} does not exist.`);
    }
    this.updateListeners.forEach((listener) => listener());
  }
}

type PreheatTempProps = {
  label: string;
  icon: "nozzle" | "bed";
  value: string | number;
  editable?: boolean;
  presetManager?: PresetsManager;
  onChange?: (val: string) => void;
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
          onChange={onChange}
          numeric
          validate={(val, setIsKeyboardVisible) => {
            setIsKeyboardVisible(false);
          }}
          inputClassName="text-base font-bold text-blue-200 sm:text-lg w-14 text-center ml-3 p-0 px-2"
          className="w-16"
          placeholder={icon === "nozzle" ? "200" : "60"}
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
  presetManager,
  initName = "",
  initBedTemp = 0,
  initToolTemp = 0,
  create = false,
}: {
  presetManager: PresetsManager;
  initName?: string;
  initBedTemp?: number;
  initToolTemp?: number;
  create?: boolean;
}) {
  const [startingCreating, setStartingCreating] = useState<boolean>(true);
  const [name, setName] = useState<string>(initName);
  const [bedTemp, setBedTemp] = useState(initBedTemp);
  const [toolTemp, setToolTemp] = useState(initToolTemp);

  const handleClick = () => {
    if (startingCreating && create) {
      setStartingCreating(false);
    } else {
      if (presetManager) {
        if (create) {
          if (!name || bedTemp <= 0 || toolTemp <= 0) {
            toast.error("Please fill in all fields before creating a preset.");
            return;
          }
          presetManager.addTempPreset({
            name: name,
            bedTemp: bedTemp,
            toolTemp: toolTemp,
          });
          setName("");
          setBedTemp(0);
          setToolTemp(0);
          setStartingCreating(true);
        } else {
          /*
          presetManager.editTempPreset({
            name: name,
            bedTemp: bedTemp,
            toolTemp: toolTemp,
          });*/
        }
      }
    }
  };

  return (
    <div
      className={
        "group flex h-[280px] max-w-[180px] min-w-[140px] flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:border-blue-500 focus:outline-none active:scale-100 sm:max-w-[220px] sm:min-w-[180px] sm:gap-4 sm:p-5"
      }
      onClick={() => {
        if (startingCreating && create) {
          setStartingCreating(false);
        }
      }}
    >
      {!create || !startingCreating ? (
        <>
          {!create ? (
            <p className="text-base font-bold text-blue-400 transition group-hover:text-blue-300 sm:text-xl">
              {name}
            </p>
          ) : (
            <ControlledInput
              value={name}
              placeholder="Name"
              onChange={(v) => setName(v)}
              validate={(v, setIsKeyboardVisible) => {
                setIsKeyboardVisible(false);
              }}
              inputClassName="text-base text-center font-bold text-blue-400 transition group-hover:text-blue-300 w-full py-0"
              className="w-20"
            />
          )}
          <div className="flex w-full flex-col gap-1 sm:gap-2">
            <PreheatTemp
              label="Nozzle"
              icon="nozzle"
              value={!startingCreating && toolTemp === 0 ? "" : toolTemp}
              editable={!startingCreating}
              onChange={(v) => setToolTemp(Number(v))}
            />
            <PreheatTemp
              label="Bed"
              icon="bed"
              value={!startingCreating && bedTemp === 0 ? "" : bedTemp}
              editable={!startingCreating}
              onChange={(v) => setBedTemp(Number(v))}
            />
          </div>
          <span
            className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-1 text-sm font-bold text-white shadow transition group-hover:bg-blue-700 hover:scale-105 hover:bg-blue-500 active:scale-95 sm:mt-4 sm:text-lg"
            onClick={handleClick}
          >
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
  const [tempPresetManager, setTempPresetManager] = useState<PresetsManager>(
    new PresetsManager(),
  );

  // Rerender on every update to the presets
  useEffect(() => {
    const manager = tempPresetManager;
    manager.addUpdateListener(() => setTempPresetManager(new PresetsManager()));
    return () => {
      // Cleanup listener
      manager.addUpdateListener(() => {});
    };
  }, [tempPresetManager]);

  return (
    <Drawer open={opened} onClose={() => setOpened(false)}>
      <DrawerPortal>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">
              Select a temp preset or create one.
            </DrawerTitle>
          </DrawerHeader>
          <motion.div
            layout
            className="flex w-full items-center justify-center gap-4 overflow-x-auto overflow-y-hidden py-4"
          >
            <AnimatePresence initial={false}>
              {tempPresetManager.getTempPresets().map((preset, index) => (
                <motion.div
                  key={preset.id}
                  layout
                  layoutId={`preset-${preset.id}`}
                  initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <TempPreset
                    initName={preset.name}
                    initBedTemp={preset.bedTemp}
                    initToolTemp={preset.toolTemp}
                    presetManager={tempPresetManager}
                  />
                </motion.div>
              ))}
              <motion.div
                key="create"
                layout
                layoutId="create"
                initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <TempPreset create={true} presetManager={tempPresetManager} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
