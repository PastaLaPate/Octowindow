import { t } from "i18next";
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
        <ActionBox
          label={t("home.actions.control")}
          icon={Move}
          color="bg-purple-600"
          to="/app/control"
        />
        <ActionBox
          label={t("home.actions.spools")}
          icon={Spool}
          color="bg-cyan-600"
          to="/app/spools"
        />
        <ActionBox
          label={t("home.actions.preheat")}
          icon={Flame}
          color="bg-orange-600"
          onClick={() => setPreheatOpened(true)}
        />
        <ActionBox
          label={t("home.actions.settings")}
          icon={Settings}
          color="bg-slate-600"
          to="/app/settings"
        />
        <ActionBox
          label={t("home.actions.print")}
          icon={Printer}
          className="col-span-2"
          to="/app/print"
        />
      </div>
      <PreHeat opened={preheatOpened} setOpened={setPreheatOpened} />
    </div>
  );
}
