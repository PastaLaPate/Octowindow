import { Power } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import Flag from "react-world-flags";

import BackButton from "@/components/backButton";

import { languageToFlag } from "@/TranslationManager";
import type { OctoprintState } from "./App";

export default function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <BackButton title={t("home.actions.settings")} />
        <div className="flex h-full w-full flex-col gap-3 overflow-y-auto">
          <h1 className="text-3xl">{t("settings.languages")}</h1>
          <div className="flex w-full flex-row flex-wrap gap-2">
            {Object.keys(i18n.services.resourceStore.data).map((lang) => {
              return (
                <button
                  key={lang}
                  className="h-10 w-10 cursor-pointer"
                  onClick={() => i18n.changeLanguage(lang)}
                >
                  <Flag code={languageToFlag[lang]} />
                </button>
              );
            })}
          </div>
          <h1 className="text-3xl">{t("settings.actions")}</h1>
          <div className="flex w-full flex-wrap gap-3">
            <div
              onClick={() => {
                octoprintState.node?.local.shutdownHost();
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 to-50% shadow-2xl md:h-24 md:w-30 lg:h-40 lg:w-60"
            >
              <Power className="md:h-14 md:w-14 lg:h-26 lg:w-26" color="red" />
              <p className="text-lg">{t("settings.actions.shutdown")}</p>
            </div>
          </div>
          <h1 className="text-3xl">{t("settings.manage")}</h1>
          <div className="flex w-full gap-3">
            <div
              onClick={() => {
                octoprintState.node?.local.checkForUpdates();
              }}
              className="rounded-xl bg-slate-800 p-3"
            >
              <p>{t("settings.manage.check_for_updates")}</p>
            </div>
            <div
              onClick={() => {
                navigate("/setup");
              }}
              className="rounded-xl bg-slate-800 p-3"
            >
              <p>{t("settings.manage.restart_setup")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
