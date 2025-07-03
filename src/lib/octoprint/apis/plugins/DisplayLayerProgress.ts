import type { Axios } from "axios";

import { OctoprintPluginAPI } from "./OctoprintPlugin";

// Def not from https://github.com/UnchartedBull/OctoDash/blob/main/src/model/octoprint/plugins/display-layer-progress.model.ts#L1
export interface DisplayLayerProgressData {
  averageLayerDuration: string;
  averageLayerDurationInSeconds: string;
  changeFilamentCount: number;
  changeFilamentTimeLeft: string;
  changeFilamentTimeLeftInSeconds: string;
  currentHeight: string;
  currentHeightFormatted: string;
  currentLayer: string;
  estimatedChangeFilamentTime: string;
  estimatedEndTime: string;
  fanspeed: string;
  feedrate: string;
  feedrateG0: string;
  feedrateG1: string;
  lastLayerDuration: string;
  m73progress: string;
  printTimeLeft: string;
  printTimeLeftInSeconds: string;
  printerState: string;
  progress: string;
  totalHeight: string;
  totalHeightFormatted: string;
  totalLayer: string;
  updateReason: string;
}

export default class DisplayLayerProgressPlugin extends OctoprintPluginAPI {
  public installed = false;

  constructor(httpClient: Axios) {
    super(httpClient, "DisplayLayerProgress");
    this.isInstalled().then((v) => {
      if (!v) {
        console.warn("DisplayLayerProgress isn't installed");
      }
      this.installed = v;
    });
  }

  public parseMSG(data: any): DisplayLayerProgressData | undefined {
    data = data["plugin"];
    if (data.plugin !== "DisplayLayerProgress-websocket-payload") return;
    return data.data as DisplayLayerProgressData;
  }
}
