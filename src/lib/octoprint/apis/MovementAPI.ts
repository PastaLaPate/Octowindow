import type { Axios } from "axios";
import { toast } from "sonner";

import { OctoprintAPI } from "./OctoprintAPI";

export type MovementAxis = "x" | "y" | "z";

// Well actually it should be in Printer API but then printer api would be too BIG so i put it here
export default class MovementAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    super(httpClient);
  }

  public async jogPrintHead(
    movementAxis: MovementAxis,
    amount: number,
    absolute = false
  ): Promise<void> {
    const resp = await this.httpClient.post("/api/printer/printhead", {
      command: "jog",
      absolute: absolute,
      [movementAxis]: amount,
    });
    if (resp.status === 409) {
      toast.error("Printer isn't connected or operational");
    } else if (resp.status === 204) {
      // toast.success("Successfully issued command")
    }
  }

  public async homeAxis(axis: MovementAxis | MovementAxis[]): Promise<void> {
    const resp = await this.httpClient.post("/api/printer/printhead", {
      command: "home",
      axes: axis instanceof Array ? axis : [axis],
    });
    if (resp.status === 409) {
      toast.error("Printer isn't connected or operational");
    }
  }

  /**
   * @param {number} feedRate - If it is an int, will be treated as percentage for factor if float as factor must be [0.5-2] or [50-200]
   */
  public async setFeedRate(feedRate: number): Promise<void> {
    const isInt = Number.isInteger(feedRate);
    if (
      (isInt && (feedRate < 50 || feedRate > 200)) ||
      (!isInt && (feedRate < 0.5 || feedRate > 2))
    ) {
      throw Error("Not in valid range.");
    }
    const resp = await this.httpClient.post("/api/printer/printhead", {
      command: "feedrate",
      factor: feedRate,
    });
    if (resp.status === 409) {
      toast.error("Printer isn't connected or operational");
    }
  }
}
