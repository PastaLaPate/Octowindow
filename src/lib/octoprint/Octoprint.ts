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

  public async authenticate(signal?: AbortSignal): Promise<void> {
    if (!this.node.url) {
      throw new InvalidNode("Node URL or port is not defined");
    }

    // Check for abort before starting
    if (signal?.aborted) throw new Error("Authentication aborted");

    // Check if the node supports the appkeys plugin
    const supportsAppKeys = await this.authWorflow.probeForWorkflow(signal);
    if (signal?.aborted) throw new Error("Authentication aborted");
    if (!supportsAppKeys) {
      throw new InvalidNode(
        "The OctoPrint node does not support the appkeys plugin"
      );
    }

    // Request authorization
    const authDialogUrl = await this.authWorflow.requestAuthorization(signal);
    if (signal?.aborted) throw new Error("Authentication aborted");
    if (!authDialogUrl) {
      throw new InvalidNode("Failed to obtain authorization dialog URL");
    }

    // Open the popup only if not aborted
    if (signal?.aborted) throw new Error("Authentication aborted");
    const popup = this.authWorflow.createWindow(authDialogUrl);

    // Wait for API key, abort if needed
    const apiKeyPromise = this.authWorflow.getApiKey(popup, signal);

    if (signal) {
      // If aborted, close the popup and throw
      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => {
          try {
            popup.close();
          } catch {}
          reject(new Error("Authentication aborted"));
        });
      });
      this.apiKey = await Promise.race([apiKeyPromise, abortPromise]);
    } else {
      this.apiKey = await apiKeyPromise;
    }
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
