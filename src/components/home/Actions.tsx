import { Flame, Move, Printer, Settings, Spool } from "lucide-react";
import { useState } from "react";

import ActionBox from "./ActionBox";
import PreHeat from "./Preheat";

export default function Actions() {
  const [preheatOpened, setPreheatOpened] = useState(false);

  return (
    <div className="flex h-full w-[50vw] items-center justify-center px-9">
      {/* Maybe add cool down action & filament manager via SpoolManager */}
      <div className="grid w-full grid-cols-2 items-center justify-items-center gap-4">
        <ActionBox label="Control" icon={Move} color="bg-purple-600" to="/app/control" />
        <ActionBox label="Spools" icon={Spool} color="bg-cyan-600" to="/app/spools" />
        <ActionBox label="Preheat" icon={Flame} color="bg-orange-600" onClick={() => setPreheatOpened(true)} />
        <ActionBox label="Settings" icon={Settings} color="bg-slate-600" to="/app/settings" />
        <ActionBox label="Print" icon={Printer} className="col-span-2" to="/app/print" />
      </div>
      <PreHeat opened={preheatOpened} setOpened={setPreheatOpened} />
    </div>
  );
}
