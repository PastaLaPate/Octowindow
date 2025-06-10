import { Flame, Move, Printer, Settings, Terminal } from "lucide-react";

import ActionBox from "./ActionBox";

export default function Actions() {
  return (
    <div className="flex h-full w-[50vw] items-center justify-center px-9">
      <div className="grid w-full grid-cols-2 items-center justify-items-center gap-4">
        <ActionBox label="Control" icon={Move} color="bg-purple-600" />
        <ActionBox label="Terminal" icon={Terminal} color="bg-cyan-600" />
        <ActionBox label="Preheat" icon={Flame} color="bg-orange-600" />
        <ActionBox label="Settings" icon={Settings} color="bg-slate-600" />
        <ActionBox
          label="Print"
          icon={Printer}
          className="col-span-2"
          to="/app/print"
        />
      </div>
    </div>
  );
}
