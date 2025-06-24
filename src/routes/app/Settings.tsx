import { ArrowLeft, Power } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import type { OctoprintState } from "./Home";

export default function Settings() {
  const navigate = useNavigate();
  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <div className="flex w-full flex-row items-center justify-start gap-4">
          <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-slate-800 transition hover:bg-slate-700">
            <ArrowLeft
              className="h-10 w-10"
              onClick={() => {
                navigate("/app/");
              }}
            />
          </div>
          <p className="text-4xl font-bold">Settings</p>
        </div>
        <div className="flex h-full flex-col gap-3 overflow-y-auto">
          <h1 className="text-3xl">Actions</h1>
          <div className="flex w-full flex-wrap gap-3">
            <div
              onClick={() => {
                octoprintState.node?.local.shutdownHost();
              }}
              className="flex h-40 w-60 flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 to-50% shadow-2xl"
            >
              <Power className="h-26 w-26" color="red" />
              <p className="text-lg">Shutdown</p>
            </div>
          </div>
          <h1 className="text-3xl">Manage OctoWindow</h1>
          <div className="flex w-full gap-3">
            <div
              onClick={() => {
                octoprintState.node?.local.checkForUpdates();
              }}
              className="rounded-xl bg-slate-800 p-3"
            >
              <p>Check for updates</p>
            </div>
            <div
              onClick={() => {
                navigate("/setup");
              }}
              className="rounded-xl bg-slate-800 p-3"
            >
              <p>Restart setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
