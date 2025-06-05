import type { Axios } from "axios";
import { OctoprintAPI } from "./OctoprintAPI";

export type ConnectionInfos = {
  connected: boolean;
  printerName: string;
};

export const SocketMessageType = {
  connected: "connected",
  reauthRequired: "reauthRequired",
  current: "current",
  history: "history",
  event: "event",
  slicingProgress: "slicingProgress",
  plugin: "plugin",
} as const;

export type SocketMessageType = keyof typeof SocketMessageType;

export class PrinterAPI extends OctoprintAPI {
  /* TODO: Remove this shit and use websockets (because this endpoints requires a wtf permisison never said how to
  obtain) 
    https://docs.octoprint.org/en/master/api/push.html
  */

  private socket: WebSocket;

  constructor(httpClienta: Axios) {
    super(httpClienta);
    const baseUrl = httpClienta.defaults.baseURL;
    const socketUrl = (
      baseUrl +
      (baseUrl?.endsWith("/") ? "" : "/") +
      "sockjs/websocket"
    ).replace(/^http/, "ws");
    const sessionInfos = httpClienta.post("/api/login", {
      passive: true,
    });
    sessionInfos.then((resp) => {
      if (resp.status === 200) {
        const usrName = resp.data.name;
        const sessionID = resp.data.session;
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = function () {
          console.log("[WebSocket] Successfully connected to " + socketUrl);
          this.send(
            JSON.stringify({
              auth: `${usrName}:${sessionID}`,
            })
          );
        };
        this.socket.onmessage = this.parseMSG;
      }
    });
  }

  public async getConnectionInfos() {
    const response = await this.httpClient.get("/api/connection");
    return {
      connected: response.data.current.state === "Operational",
      printerName: response.data.current.name || "Unknown Printer",
    };
  }

  private parseMSG(msg: MessageEvent<any>) {
    const data = JSON.parse(msg.data);
    const msgType = Object.keys(data)[0];
    // Check if msgType is in SocketMessageType
    if (!Object.keys(SocketMessageType).includes(msgType)) {
      console.warn("[WebSocket] Unknown message type:", msgType);
      return;
    }

    switch (msgType) {
      case SocketMessageType.connected:
        break;
    }
  }
}
