import type { Axios } from "axios";

import type { PrinterTarget } from "../Octoprint";
import type { Print } from "./FileAPI";
import MovementAPI from "./MovementAPI";
import { OctoprintAPI } from "./OctoprintAPI";
import ToolAPI from "./ToolAPI";

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

export type Temp = {
  targetDevice: PrinterTarget;
  current: number;
  target: number;
  setTemp: (newTemp: number) => void | Promise<void>; // can throw error
  addTemp: (addCelsius: number) => void; // can be negative
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
  private socket?: WebSocket;
  private listeners: {
    temp: Array<(tool: Temp, bed: Temp) => void>;
    status: Array<(newStatus: ConnectionInfos) => void>;
    jobStatus: Array<(newJobStatus: Print) => void>;
  };
  private activeProfile: PrinterProfile;

  public move: MovementAPI;
  public tool: ToolAPI;
  public connectionInfos: ConnectionInfos;

  constructor(httpClient: Axios) {
    super(httpClient);

    this.move = new MovementAPI(httpClient);
    this.tool = new ToolAPI(httpClient);

    this.listeners = { temp: [], status: [], jobStatus: [] };
    this.activeProfile = {
      current: false,
      name: "",
      id: "",
    };
    this.connectionInfos = {
      connected: false,
      flags: allFalseFlags,
      printerName: "",
    };
    this.initWS();
    this.fetchProfiles();
  }

  public async connectPrinter() {
    const resp = await this.httpClient.post("/api/connection", {
      command: "connect",
    });
    if (resp.status === 204) {
      //Doesn't actually mean that the printer successfully connected
      /* this.connectionInfos.connected = true;
      await this.fetchProfiles();
      this.connectionInfos.printerName = this.activeProfile.name;
      this.callListeners("status", this.connectionInfos);*/
    }
  }

  public async setBedTemp(target: number) {
    const resp = await this.httpClient.post("/api/printer/bed", {
      command: "target",
      target: target,
    });
    if (resp.status === 400) {
      throw Error(
        "Target outside of the supported range, or the request is invalid.",
      );
    } else if (resp.status === 409) {
      throw Error("Printer isn't operational or doesn't have bed");
    }
  }

  public async setToolTemp(target: number) {
    const resp = await this.httpClient.post("/api/printer/tool", {
      command: "target",
      targets: {
        tool: target,
      },
    });
    if (resp.status === 400) {
      throw Error("Isn't in temp range");
    } else if (resp.status === 409) {
      throw Error("Printer isn't operational");
    }
  }

  public addListener<T extends keyof ListenerTypes>(
    type: T,
    callback: ListenerTypes[T],
  ) {
    (this.listeners[type] as ListenerTypes[T][]).push(callback);
  }

  private async initWS() {
    const baseUrl = this.httpClient.defaults.baseURL;
    const socketUrl = (
      baseUrl +
      (baseUrl?.endsWith("/") ? "" : "/") +
      "sockjs/websocket"
    ).replace(/^http/, "ws");
    const resp = await this.httpClient.post(
      "/api/login",
      {
        passive: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (resp.status === 200) {
      resp.data = resp.data;
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
  }

  private parseMSG = (msg: MessageEvent) => {
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
      case SocketMessageType.history: {
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
      }
      case SocketMessageType.current: {
        const currentData = data["current"];
        const state = currentData.state;
        const prevFlags = this.connectionInfos.flags;
        const newFlags = state.flags;
        const flagsChanged = Object.keys(prevFlags).some(
          (key) =>
            prevFlags[key as keyof typeof prevFlags] !==
            newFlags[key as keyof typeof newFlags],
        );
        if (flagsChanged) {
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
        if (
          currentData.temps !== undefined &&
          currentData.temps[0] !== undefined &&
          currentData.temps[0].tool0 !== undefined &&
          currentData.temps[0].bed !== undefined
        ) {
          const tool = currentData.temps[0].tool0;
          const bed = currentData.temps[0].bed;
          this.callListeners(
            "temp",
            {
              targetDevice: "tool",
              current: tool.actual,
              target: tool.target,
              setTemp: (newTemp) => this.setToolTemp(newTemp),
              addTemp(addCelsius) {
                this.setTemp(this.current + addCelsius);
              },
            },
            {
              targetDevice: "bed",
              current: bed.actual,
              target: bed.target,
              setTemp: (newTemp) => this.setBedTemp(newTemp),
              addTemp(addCelsius) {
                this.setTemp(this.current + addCelsius);
              },
            },
          );
        }
        break;
      }
    }
  };
  private callListeners<T extends keyof ListenerTypes>(
    type: T,
    ...args: Parameters<ListenerTypes[T]>
  ) {
    if (this.listeners[type]) {
      (
        this.listeners[type]! as Array<
          (...args: Parameters<ListenerTypes[T]>) => void
        >
      ).forEach((element) => {
        element(...(args as Parameters<ListenerTypes[T]>));
      });
    }
  }

  private async fetchProfiles() {
    const resp = await this.httpClient.get("/api/printerprofiles");
    if (resp.status !== 200) {
      return;
    }
    type ProfileData = {
      name: string;
      current: boolean;
    };
    for (const [index, profile] of Object.entries(
      resp.data.profiles as Record<string, ProfileData>,
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
