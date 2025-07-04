import type { Axios } from "axios";
import { t } from "i18next";

import { OctoprintAPI } from "./OctoprintAPI";

export default class JobAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    super(httpClient);
  }

  public async startJob(): Promise<void> {
    const resp = await this.httpClient.post("/api/job", {
      command: "start",
    });
    if (resp.status === 409) {
      throw new Error(t("errors.E0004"));
    }
  }

  public async cancelJob(): Promise<void> {
    const resp = await this.httpClient.post("/api/job", {
      command: "cancel",
    });
    if (resp.status === 409) {
      throw new Error("Printer isn't connected or printing.");
    }
  }

  public async restartJob(): Promise<void> {
    const resp = await this.httpClient.post("/api/job", {
      command: "restart",
    });
    if (resp.status === 409) {
      throw new Error("No job to be restarted.");
    }
  }

  public async pauseJob(): Promise<void> {
    await this.jobPauseCommand("pause");
  }

  public async resumeJob(): Promise<void> {
    await this.jobPauseCommand("resume");
  }

  public async toggleJob(): Promise<void> {
    await this.jobPauseCommand("toggle");
  }

  private async jobPauseCommand(action: string): Promise<void> {
    const resp = await this.httpClient.post("/api/job", {
      command: "pause",
      action: action,
    });

    if (resp.status === 409) {
      throw new Error("No active job...");
    }
  }
}
