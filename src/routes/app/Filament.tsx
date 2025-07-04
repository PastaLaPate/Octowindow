import { motion } from "framer-motion";
import { t } from "i18next";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { FilamentSpool } from "@/lib/octoprint/apis/plugins/SpoolManager";
import { cn } from "@/lib/utils";
import BackButton from "@/components/backButton";
import { Skeleton } from "@/components/ui/skeleton";

import type { OctoprintState } from "./App";

// TODO: Add filament spools

function Spool({
  spool,
  current = false,
  idx = 0,
  onSelect = (spool: FilamentSpool) => {},
}: {
  spool: FilamentSpool;
  current?: boolean;
  idx: number;
  onSelect?: (spool: FilamentSpool) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0.4, y: -(idx * 56 + idx * 8) }} // Fancy calculations (56 equivalent to h-14 8 equivalent to gap-2)
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.25 }}
      className={cn(
        "relative min-h-14 w-full rounded-xl bg-slate-800",
        current && "border-2 border-blue-600"
      )}
    >
      <div
        className={`absolute top-1/2 left-6 flex -translate-y-1/2 items-center justify-center gap-2`}
      >
        <span
          className="size-6 rounded-full border-2 border-slate-400"
          style={{ backgroundColor: spool.color }}
        />
        <p>{spool.material}</p>
      </div>
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {spool.displayName}
      </p>
      <button
        disabled={current}
        className={cn(
          "absolute top-1/2 right-6 -translate-y-1/2 rounded-lg px-4 py-1 font-bold shadow-2xl transition-all duration-150",
          current
            ? "cursor-not-allowed bg-slate-700 text-slate-400"
            : "bg-blue-600 text-white hover:scale-105 hover:bg-blue-700 active:bg-blue-800"
        )}
        onClick={() => {
          if (!current) {
            onSelect(spool);
          }
        }}
      >
        {current ? t("spools.current") : t("general.select")}
      </button>
    </motion.div>
  );
}

export default function FilamentPage() {
  const octoprintState: OctoprintState = useOutletContext();
  const [spools, setSpools] = useState<FilamentSpool[]>([]);
  const [currentSpool, setCurrentSpool] = useState<FilamentSpool>();
  const [loading, setLoading] = useState<boolean>(true);
  const refreshSpools = async () => {
    setSpools(await octoprintState.node.spools.getSpools());
  };
  const refreshCurrentSpool = async () => {
    setCurrentSpool(await octoprintState.node.spools.getCurrentSpool());
  };
  const filterByCurrentSpool = () =>
    spools.filter((v) => v.id !== currentSpool?.id);
  const refresh = async () => {
    setLoading(true);
    if (octoprintState.node) {
      await refreshSpools();
      await refreshCurrentSpool();
    }
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, [octoprintState.node]);
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <BackButton title={t("home.actions.spools")}>
          <div
            className={cn(
              "absolute right-1 flex items-center justify-center rounded-full bg-slate-800 md:size-10 lg:size-14",
              loading ? "animate-spin" : ""
            )}
            onClick={() => {
              if (!loading) {
                refresh();
              }
            }}
          >
            <RefreshCw className="md:size-6 lg:size-10" />
          </div>
        </BackButton>
        <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-3">
          {!loading && spools && currentSpool ? (
            <>
              <Spool spool={currentSpool} current key={0} idx={0} />
              {filterByCurrentSpool().map((spool, i) => (
                <Spool
                  spool={spool}
                  key={i + 1}
                  idx={i + 1}
                  onSelect={(spool) => {
                    octoprintState.node.spools.selectSpool(spool);
                    refresh();
                  }}
                />
              ))}
            </>
          ) : (
            <>
              {[...Array(5)].map((v, i) => {
                return <Skeleton key={i} className="min-h-14 w-full" />;
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
