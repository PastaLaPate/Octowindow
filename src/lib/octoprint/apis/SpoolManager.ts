import type { Axios } from "axios";

import { OctoprintAPI } from "./OctoprintAPI";

// Definitly not from OctoDash (https://github.com/UnchartedBull/OctoDash/blob/main/src/services/filament/spool-manager.octoprint.service.ts)
// also https://github.com/UnchartedBull/OctoDash/blob/main/src/model/octoprint/plugins/spool-manager.model.ts#L1

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

  public async getSpools(): Promise<FilamentSpool[]> {
    const resp = await this.httpClient.get("plugin/SpoolManager/loadSpoolsByQuery", {
      params: {
        filterName: "hideInactiveSpool",
        from: 0,
        to: 1000,
        sortColumn: "lastUse",
        sortOrder: "desc",
      },
    });
    if (resp.status !== 200) {
      throw new Error("Error");
    }
    return resp.data.allSpools.map((spool: any) => {
      return this.parseSpool(spool);
    });
  }

  public async getCurrentSpool(): Promise<FilamentSpool> {
    const resp = await this.httpClient.get("plugin/SpoolManager/loadSpoolsByQuery", {
      params: {
        filterName: "hideInactiveSpool",
        from: 0,
        to: 1000,
        sortColumn: "lastUse",
        sortOrder: "desc",
      },
    });
    if (resp.status !== 200) {
      throw new Error("Error");
    }
    return this.parseSpool(resp.data.selectedSpools[0]);
  }

  // TODO: Add select spool

  private parseSpool(spool: any): FilamentSpool {
    if (!spool) throw new Error("Invalid spool");
    return {
      color: spool.color ?? "#FF0000",
      density: spool.density,
      diameter: spool.diameter,
      displayName: `${spool.vendor} - ${spool.displayName}`,
      id: spool.databaseId ?? spool.id,
      material: spool.material,
      name: spool.displayName,
      temperatureOffset: spool.offsetTemperature ?? 0,
      used: Number(spool.usedWeight),
      vendor: spool.vendor,
      weight: spool.totalWeight,
    };
  }
}
