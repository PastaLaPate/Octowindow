import { Axios } from "axios";
import AuthorizationWorkflow from "./Auth";

export type OctoprintNodeType = {
  url: string;
  port: number;
  version: string;
};

type StoreType = {
  connected: boolean;
  host: string;
  port: number | undefined;
  apiKey: string;
  userName: string;
};

export class InvalidNode extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidNode.prototype);
  }
}

export class OctoprintNode {
  private node: OctoprintNodeType;
  private httpClient: Axios;
  public authWorflow: AuthorizationWorkflow;
  private apiKey: string | undefined;

  constructor(node: OctoprintNodeType) {
    this.node = node;
    const baseUrl = `${node.url}${
      node.port !== undefined ? `:${node.port}` : ""
    }`;
    this.httpClient = new Axios({
      baseURL: baseUrl,
    });
    // Verify if the node is reachable
    this.verifyNode();
    this.authWorflow = new AuthorizationWorkflow(baseUrl, "", "OctoWindow");
  }

  public async authenticate() {
    if (!this.node.url) {
      throw new InvalidNode("Node URL or port is not defined");
    }

    // Check if the node supports the appkeys plugin
    const supportsAppKeys = await this.authWorflow.probeForWorkflow();
    if (!supportsAppKeys) {
      throw new InvalidNode(
        "The OctoPrint node does not support the appkeys plugin"
      );
    }

    // Request authorization
    const authDialogUrl = await this.authWorflow.requestAuthorization();
    if (!authDialogUrl) {
      throw new InvalidNode("Failed to obtain authorization dialog URL");
    }
    this.apiKey = await this.authWorflow.getApiKey(authDialogUrl);
  }

  public async verifyNode() {
    // Verify via /static/webassets/packed_client.js because /api/version needs authentication
    // and we want to ensure the node is reachable without authentication first.
    try {
      const response = await this.httpClient.get(
        "/static/webassets/packed_client.js"
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.error("Error verifying node:", error);
      throw new Error("Node is not reachable");
    }
    return false;
  }

  public getUrl(): string {
    return this.node.url;
  }

  public getPort(): number {
    return this.node.port;
  }

  public getVersion(): string {
    return this.node.version;
  }
}

export class StoreManager {
  private store: StoreType;

  constructor() {
    this.store = {
      connected: false,
      host: "",
      port: 0,
      apiKey: "",
      userName: "",
    };
    this.loadStore();
  }

  public loadStore() {
    const keys = Object.keys(this.store);
    keys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        switch (key) {
          case "connected":
            this.store.connected = value === "true";
            break;
          case "host":
            this.store.host = value;
            break;
          case "port":
            this.store.port = Number(value);
            break;
          case "apiKey":
            this.store.apiKey = value;
            break;
          case "userName":
            this.store.userName = value;
            break;
        }
      }
    });
  }

  public saveStore() {
    for (const key in this.store) {
      if (this.store.hasOwnProperty(key)) {
        localStorage.setItem(key, String(this.store[key as keyof StoreType]));
      }
    }
  }
}
