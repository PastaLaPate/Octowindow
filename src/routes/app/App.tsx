import { useEffect, useState } from "react";

import "./App.css";

import { t } from "i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import type { DisplayLayerProgressData } from "@/lib/octoprint/apis/plugins/DisplayLayerProgress";
import {
  allFalseFlags,
  type ConnectionInfos,
  type JobInfos,
  type Progress,
  type Temp,
} from "@/lib/octoprint/apis/PrinterAPI";
import { OctoprintNode, StoreManager } from "@/lib/octoprint/Octoprint";
import TopBar from "@/components/Topbar";
import { Toaster } from "@/components/ui/sonner";

import { AnimationLayout } from "../PageAnimation";

export type OctoprintState = {
  node?: OctoprintNode;
  bedTemp: Temp;
  toolTemp: Temp;
  connectionInfos: ConnectionInfos;
  job?: JobInfos;
  progress?: Progress;
  layerProgress?: DisplayLayerProgressData;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [node, setNode] = useState<OctoprintNode>();
  const [bedTemp, setBedTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "bed",
    async addTemp(addCelsius) {
      throw Error(t("errors.E0001"));
    },
    async setTemp(newTemp) {
      throw Error(t("errors.E0001"));
    },
  });
  const [toolTemp, setToolTemp] = useState<Temp>({
    current: 0,
    target: 0,
    targetDevice: "tool",
    async addTemp(addCelsius) {
      throw Error(t("errors.E0001"));
    },
    async setTemp(newTemp) {
      throw Error(t("errors.E0001"));
    },
  });
  const [connectionInfos, setConnectionInfos] = useState<ConnectionInfos>({
    connected: false,
    printerName: "",
    flags: allFalseFlags,
  });
  const [progress, setProgress] = useState<Progress>();
  const [jobStatus, setJobStatus] = useState<JobInfos>();
  const [layerProgress, setLayerProgress] =
    useState<DisplayLayerProgressData>();
  useEffect(() => {
    const node = new OctoprintNode();
    if (!new StoreManager().store.connected) {
      navigate("/setup/");
    }
    node?.printer.addListener("temp", (tool, bed) => {
      setBedTemp(bed);
      setToolTemp(tool);
    });
    node?.printer.addListener("status", (infos) => {
      setConnectionInfos(infos);
      console.log(location.pathname);
      if (infos.flags.printing && !location.pathname.includes("job")) {
        navigate("/app/job");
      }
    });
    node?.printer.addListener("jobStatus", (newJobStatus) => {
      setJobStatus(newJobStatus);
    });
    node?.printer.addListener("progress", (newProgress) => {
      setProgress(newProgress);
    });
    node?.printer.addListener("layerProgress", (newLayerProgress) => {
      setLayerProgress(newLayerProgress);
    });
    setNode(node);
  }, []);
  let octoprintState: OctoprintState = {
    bedTemp: bedTemp,
    toolTemp: toolTemp,
    connectionInfos: connectionInfos,
    progress: progress,
    job: jobStatus,
    layerProgress: layerProgress,
    node: node,
  };
  return (
    <AnimationLayout>
      <div className="flex h-screen w-screen flex-col bg-slate-950">
        <Toaster position="bottom-left" richColors />
        {octoprintState && (
          <>
            <TopBar octoprintState={octoprintState} />
            <div className="flex h-full min-h-0 w-screen flex-1">
              <Outlet context={octoprintState} />
            </div>
          </>
        )}
      </div>
    </AnimationLayout>
  );
  /*
  return (
    <div>
      {!isSetupComplete ? (
        <Setup onCompleted={() => setIsSetupComplete(true)} />
      ) : (
        <Home />
      )}
    </div>
  );*/
}

export default App;
