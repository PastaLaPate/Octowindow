import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { FilamentSpool } from "@/lib/octoprint/apis/SpoolManager";
import BackButton from "@/components/backButton";

import type { OctoprintState } from "./Home";

function Spool({ spool, current = false }: { spool: FilamentSpool; current?: boolean }) {
  return (
    <div className="relative h-14 w-full rounded-xl bg-slate-800">
      <p className={`absolute top-1/2 left-6 -translate-y-1/2 rounded-lg border-2 border-[${spool.color}] p-1`}>
        {spool.material}
      </p>
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{spool.displayName}</p>
    </div>
  );
}

export default function FilamentPage() {
  const octoprintState: OctoprintState = useOutletContext();
  const [spools, setSpools] = useState<FilamentSpool[]>([]);
  const [currentSpool, setCurrentSpool] = useState<FilamentSpool>();
  const refreshSpools = async () => {
    setSpools(await octoprintState.node.spools.getSpools());
  };
  const refreshCurrentSpool = async () => {
    setCurrentSpool(await octoprintState.node.spools.getCurrentSpool());
  };
  const filterByCurrentSpool = () => spools.filter((v) => v.id !== currentSpool?.id);
  useEffect(() => {
    if (octoprintState.node) {
      refreshSpools();
      refreshCurrentSpool();
    }
  }, [octoprintState.node]);
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <BackButton title="Control" />
        <div className="flex w-full flex-col gap-2">
          {filterByCurrentSpool().map((spool) => (
            <Spool spool={spool} />
          ))}
        </div>
      </div>
    </div>
  );
}
