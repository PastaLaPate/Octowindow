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

  public async authenticate(signal?: AbortSignal): Promise<string> {
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
    await this.authWorflow.requestAuthorization();
    if (signal?.aborted) throw new Error("Authentication aborted");

    this.apiKey = await this.authWorflow.getApiKey(signal);
    return this.apiKey;
  }

  public async verifyNode(signal?: AbortSignal) {
    // Verify via /static/webassets/packed_client.js because /api/version needs authentication
    // and we want to ensure the node is reachable without authentication first.
    try {
      const response = await this.httpClient.get(
        "/static/webassets/packed_client.js",
        { signal }
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new Error("Verification aborted");
      }
      console.error("Error verifying node:", error);
      throw new Error("Node is not reachable");
    }
    return false;
  }

  public loadFromStore(storeManager: StoreManager) {
    this.apiKey = storeManager.store.apiKey || undefined;
    this.node.url = storeManager.store.host;
    this.authWorflow.userName = storeManager.store.userName;

    if (this.node.url === "" || this.node.port === 0) {
      throw new InvalidNode("Node URL or port is not defined");
    }

    // Reinitialize the HTTP client with the loaded URL and port
    this.httpClient = new Axios({
      baseURL: `${this.node.url}`,
    });
  }

  public saveToStore(storeManager: StoreManager) {
    storeManager.store.connected = this.apiKey !== undefined;
    storeManager.store.host = this.node.url;
    storeManager.store.port = this.node.port;
    storeManager.store.apiKey = this.apiKey || "";
    storeManager.store.userName = this.authWorflow.userName;
    storeManager.saveStore();
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
  public store: StoreType;

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
      if (Object.prototype.hasOwnProperty.call(this.store, key)) {
        localStorage.setItem(key, String(this.store[key as keyof StoreType]));
      }
    }
  }
}
