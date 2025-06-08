import { Flame, Move, Printer, Settings, Terminal } from "lucide-react";
import ActionBox from "./ActionBox";

export default function Actions() {
  return (
    <div className="h-full w-[50vw] px-9 flex items-center">
      <div className="grid grid-cols-2 gap-4 w-full h-2/3 items-center justify-items-center">
        <ActionBox label="Control" icon={Move} color="bg-purple-600" />
        <ActionBox label="Terminal" icon={Terminal} color="bg-cyan-600" />
        <ActionBox label="Preheat" icon={Flame} color="bg-orange-600" />
        <ActionBox label="Settings" icon={Settings} color="bg-gray-600" />
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
