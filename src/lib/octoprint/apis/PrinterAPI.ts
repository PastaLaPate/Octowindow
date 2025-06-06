import type { Axios } from "axios";
import { OctoprintAPI } from "./OctoprintAPI";
import { cp, stat } from "fs";

export const ConnectionFlags = {
  cancelling: "cancelling",
  closedOrError: "closedOrError",
  error: "error",
  finishing: "finishing",
  operational: "operational",
  paused: "paused",
  pausing: "pausing",
  printing: "printing",
  ready: "ready",
  resuming: "resuming",
  sdReady: "sdReady",
} as const;

export type ConnectionInfos = {
  printerName: string;
  flags: (typeof ConnectionFlags)[];
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

export type Print = {
  display: string;
  name: string;
  path: string;
  size: string;
};

export type Temp = {
  targetDevice: "tool" | "bed";
  current: number;
  target: number;
};

export type ListenerTypes = {
  temp: (tool: Temp, bed: Temp) => void;
  status: (newStatus: ConnectionInfos) => void;
  jobStatus: (newJobStatus: Print) => void;
};

export type SocketMessageType = keyof typeof SocketMessageType;

export class PrinterAPI extends OctoprintAPI {
  /* TODO: Remove this shit and use websockets (because this endpoints requires a wtf permisison never said how to
  obtain) 
    https://docs.octoprint.org/en/master/api/push.html
  */

  private socket?: WebSocket;
  private listeners: {
    temp?: ListenerTypes["temp"][];
    status?: ListenerTypes["status"][];
    jobStatus?: ListenerTypes["jobStatus"][];
  };

  constructor(httpClienta: Axios) {
    super(httpClienta);
    const baseUrl = httpClienta.defaults.baseURL;
    const socketUrl = (
      baseUrl +
      (baseUrl?.endsWith("/") ? "" : "/") +
      "sockjs/websocket"
    ).replace(/^http/, "ws");
    const sessionInfos = httpClienta.post(
      "/api/login",
      JSON.stringify({
        passive: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    sessionInfos.then((resp) => {
      if (resp.status === 200) {
        resp.data = JSON.parse(resp.data);
        const usrName = resp.data.name;
        const sessionID = resp.data.session;
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = function () {
          console.log("[WebSocket] Successfully connected to " + socketUrl);
          this.send(
            JSON.stringify({
              subscribe: {
                state: {
                  logs: true,
                  messages: false,
                },
                event: true,
                plugins: false,
              },
            })
          );
          this.send(
            JSON.stringify({
              auth: `${usrName}:${sessionID}`,
            })
          );
        };
        this.socket.onmessage = this.parseMSG;
      }
    });
    this.listeners = { temp: [], status: [], jobStatus: [] };
  }

  public addListener<T extends keyof ListenerTypes>(
    type: T,
    callback: ListenerTypes[T]
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type]!.push(callback as any);
  }

  public async getConnectionInfos() {}

  private parseMSG = (msg: MessageEvent<any>) => {
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
      case SocketMessageType.current:
        const currentData = data["current"];
        const state = currentData;

        if (state.temps && state.temps[0]) {
          const tool = state.temps[0].tool0;
          const bed = state.temps[0].bed;
          console.log(tool, bed);
          this.callListeners(
            "temp",
            {
              targetDevice: "tool",
              current: tool.actual,
              target: tool.target,
            },
            {
              targetDevice: "bed",
              current: bed.actual,
              target: bed.target,
            }
          );
        }
        break;
    }
  };
  private callListeners<T extends keyof ListenerTypes>(
    type: T,
    ...args: Parameters<ListenerTypes[T]>
  ) {
    if (this.listeners[type]) {
      (this.listeners[type]! as ListenerTypes[T][]).forEach((element) => {
        (element as (...args: any[]) => void).apply(null, args);
      });
    }
  }
}
