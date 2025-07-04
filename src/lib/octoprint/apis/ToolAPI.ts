// same as movement API

import type { Axios } from "axios";
import { t } from "i18next";
import { toast } from "sonner";

import { OctoprintAPI } from "./OctoprintAPI";

export default class ToolAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    super(httpClient);
  }

  public async setTemp(temp: number) {
    this.toolCommand("target", {
      targets: {
        tool: temp,
      },
    });
  }

  public async setOffset(offset: number) {
    this.toolCommand("offset", {
      offsets: {
        tool: offset,
      },
    });
  }

  /**
   * Extrude/Retract
   * @param {number} amount - Amount in mm to extrude can be negative to retract
   */
  public async extrude(amount: number) {
    this.toolCommand("extrude", {
      amount: amount,
    });
  }

  /**
   * Set flow rate of the tool
   * @param {number} flowRate - Float or int factor between 75 - 125 or 0.75 - 1.25
   */
  public async setFlowRate(flowRate: number) {
    const isInt = Number.isInteger(flowRate);
    if (
      (isInt && (flowRate < 75 || flowRate > 125)) ||
      (!isInt && (flowRate < 0.75 || flowRate > 1.25))
    ) {
      throw Error("Invalid flowRate Range");
    }
    this.toolCommand("flowrate", {
      factor: flowRate,
    });
  }

  private async toolCommand(
    command: "target" | "offset" | "select" | "extrude" | "flowrate",
    data: Object
  ) {
    const resp = await this.httpClient.post("/api/printer/tool", {
      command: command,
      ...data,
    });
    if (resp.status === 409) {
      toast.error(t("errors.E0004"));
    } else if (resp.status === 400) {
      toast.error(t("errors.E0009"));
    }
  }
}
