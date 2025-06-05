import { OctoprintAPI } from "./OctoprintAPI";

export type ConnectionInfos = {
  connected: boolean;
  printerName: string;
};

export class PrinterAPI extends OctoprintAPI {
  /* TODO: Remove this shit and use websockets (because this endpoints requires a wtf permisison never said how to
  obtain) 
    https://docs.octoprint.org/en/master/api/push.html
  */
  public async getConnectionInfos() {
    const response = await this.httpClient.get("/api/connection");
    return {
      connected: response.data.current.state === "Operational",
      printerName: response.data.current.name || "Unknown Printer",
    };
  }
}
