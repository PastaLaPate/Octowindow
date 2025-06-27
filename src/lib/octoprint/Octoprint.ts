import axios, { Axios } from "axios";

import { FileAPI } from "./apis/FileAPI";
import { OctoWindowAPI } from "./apis/OctoWindowAPI";
import { PrinterAPI } from "./apis/PrinterAPI";
import SpoolManager from "./apis/SpoolManager";
import AuthorizationWorkflow from "./Auth";

export type OctoprintNodeType = {
  url: string;
  port?: number;
  version: string;
};

export type PrinterTarget = "tool" | "bed";

export class InvalidNode extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidNode.prototype);
  }
}
/*
NOTE: Also serves as an interface for the backend custom API for shutting down the host and use the bonjour discovery service.
*/

export class OctoprintNode {
  private node: OctoprintNodeType;
  private httpClient: Axios;
  private apiKey: string | undefined;

  public file: FileAPI;
  public printer: PrinterAPI;
  public local: OctoWindowAPI;
  public spools: SpoolManager;

  public authWorflow: AuthorizationWorkflow;

  constructor(node?: OctoprintNodeType) {
    this.httpClient = new Axios({
      baseURL: "",
    });
    let baseUrl = "";
    if (!node) {
      this.node = {
        url: "",
        port: undefined,
        version: "",
      };
      this.loadFromStore(new StoreManager());
      node = this.node;
    } else {
      this.node = node;
      baseUrl = `${node.url}${node.port !== undefined ? `:${node.port}` : ""}`;
      this.httpClient = new Axios({
        baseURL: baseUrl,
        transformRequest: axios.defaults.transformRequest,
        transformResponse: axios.defaults.transformResponse,
      });
    }

    // Verify if the node is reachable
    //this.verifyNode();
    this.authWorflow = new AuthorizationWorkflow(baseUrl, "", "OctoWindow");
    this.file = new FileAPI(this.httpClient);
    this.printer = new PrinterAPI(this.httpClient);
    this.local = new OctoWindowAPI(this.httpClient);
    this.local.testAPI().then(() => {
      this.local.checkForUpdates();
    });
    this.spools = new SpoolManager(this.httpClient);
  }

  public async getApiVersion() {
    if (!this.apiKey) {
      throw new InvalidNode("API key is not set. Please authenticate first.");
    }

    try {
      const response = await this.httpClient.get("/api/version", {
        headers: { "X-Api-Key": this.apiKey },
      });
      if (response.status === 200 && response.data) {
        if (this.node.version === "Unknown" || this.node.version === "" || this.node.version !== response.data.text) {
          this.node.version = response.data.text;
          this.saveToStore(new StoreManager());
        }
        return this.node.version;
      }
    } catch (error) {
      console.error("Error fetching API version:", error);
      throw new Error("Failed to fetch API version");
    }
    return "Unknown";
  }

  public async authenticate(signal?: AbortSignal): Promise<string> {
    if (!this.node.url) {
      throw new InvalidNode("Node URL or port is not defined");
    }

    // Check if the node supports the appkeys plugin
    const supportsAppKeys = await this.authWorflow.probeForWorkflow();
    if (!supportsAppKeys) {
      throw new InvalidNode("The OctoPrint node does not support the appkeys plugin");
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
      const response = await this.httpClient.get("/static/webassets/packed_client.js", { signal });
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
    this.node.version = "Unknown";

    if (this.node.url === "" || this.node.port === 0) {
      throw new InvalidNode("Node URL or port is not defined");
    }

    // Reinitialize the HTTP client with the loaded URL and port
    this.httpClient = new Axios({
      baseURL: `${this.node.url}`,
      headers: {
        "X-Api-Key": this.apiKey || "",
      },
      transformRequest: axios.defaults.transformRequest,
      transformResponse: axios.defaults.transformResponse,
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

  public getPort(): number | undefined {
    return this.node.port;
  }

  public getVersion(): string {
    return this.node.version;
  }
}

export type TTempPreset = {
  id?: number; // Unique identifier for the preset
  name: string;
  bedTemp: number;
  toolTemp: number;
};

type StoreType = {
  connected: boolean;
  host: string;
  port?: number;
  apiKey: string;
  userName: string;
  tempPresets?: TTempPreset[];
};

export class StoreManager {
  public store: StoreType;

  constructor() {
    this.store = {
      connected: false,
      host: "",
      port: 0,
      apiKey: "",
      userName: "",
      tempPresets: [],
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
          case "tempPresets":
            this.store.tempPresets = JSON.parse(value) as TTempPreset[];
        }
      }
    });
  }

  public saveStore() {
    for (const key in this.store) {
      if (Object.prototype.hasOwnProperty.call(this.store, key)) {
        if (key === "tempPresets") {
          localStorage.setItem(key, JSON.stringify(this.store.tempPresets || []));
          continue;
        }
        localStorage.setItem(key, String(this.store[key as keyof StoreType]));
      }
    }
  }
}
