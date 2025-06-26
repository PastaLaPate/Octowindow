import type { Axios } from "axios";

import { OctoprintAPI } from "./OctoprintAPI";

// Definitly not from OctoDash (https://github.com/UnchartedBull/OctoDash/blob/main/src/services/filament/spool-manager.octoprint.service.ts)

export type FilamentSpool = {
  id: number;
  name: string;
  displayName: string;
  color: string;
  material: string;
  temperatureOffset: number;
  used: number;
  weight: number;
  vendor: string;
  diameter: number;
  density: number;
};
export default class SpoolManager extends OctoprintAPI {
  // /plugin/SpoolManager
  constructor(httpClient: Axios) {
    super(httpClient);
  }
}
