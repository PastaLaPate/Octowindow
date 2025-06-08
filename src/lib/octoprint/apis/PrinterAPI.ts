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
  connected: boolean;
  printerName: string;
  flags: { [K in keyof typeof ConnectionFlags]: boolean };
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
  thumbnail: string;
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

export type PrinterProfile = {
  current: boolean;
  id: string;
  name: string;
};

export type SocketMessageType = keyof typeof SocketMessageType;

export const allFalseFlags = Object.fromEntries(
  Object.keys(ConnectionFlags).map((k) => [k, false]),
) as { [K in keyof typeof ConnectionFlags]: boolean };

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
  private activeProfile: PrinterProfile;
  public connectionInfos: ConnectionInfos;

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
      },
    );
    this.connectionInfos = {
      connected: false,
      flags: allFalseFlags,
      printerName: "",
    };
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
            }),
          );
          this.send(
            JSON.stringify({
              auth: `${usrName}:${sessionID}`,
            }),
          );
        };
        this.socket.onmessage = this.parseMSG;
      }
    });
    this.listeners = { temp: [], status: [], jobStatus: [] };
    this.activeProfile = {
      current: false,
      name: "",
      id: "",
    };
    this.fetchProfiles();
  }

  public addListener<T extends keyof ListenerTypes>(
    type: T,
    callback: ListenerTypes[T],
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type]!.push(callback as any);
  }

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
      case SocketMessageType.history:
        const historyData = data["history"];

        this.fetchProfiles().then(() => {
          this.connectionInfos = {
            connected: historyData.state.flags.operational,
            printerName: this.activeProfile.name,
            flags: historyData.state.flags,
          };
          this.callListeners("status", this.connectionInfos);
        });
        break;
      case SocketMessageType.current:
        const currentData = data["current"];
        const state = currentData.state;

        if (
          this.connectionInfos.flags["operational"] !== state.flags.operational
        ) {
          // Make sure we have the correct activate profile
          this.fetchProfiles().then(() => {
            this.connectionInfos = {
              printerName: this.activeProfile.name,
              connected: state.flags.operational,
              flags: state.flags,
            };
            this.callListeners("status", this.connectionInfos);
          });
        }
        if (currentData.temps && currentData.temps[0]) {
          const tool = currentData.temps[0].tool0;
          const bed = currentData.temps[0].bed;
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
            },
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

  private async fetchProfiles() {
    const resp = await this.httpClient.get("/api/printerprofiles");
    if (resp.status !== 200) {
      return;
    }
    resp.data = JSON.parse(resp.data);
    for (const [index, profile] of Object.entries(
      resp.data.profiles as Record<string, any>,
    )) {
      if (profile.current) {
        this.activeProfile = {
          current: true,
          name: profile.name,
          id: index,
        };
        break;
      }
    }
  }
}
