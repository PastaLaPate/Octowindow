import { Axios } from "axios";

export type OctoprintNodeType = {
  url: string;
  port: number;
  version: string;
};

type StoreType = {
  connected: boolean;
  host: string;
  port: number;
  apiKey: string;
  userName: string;
};

class OctoprintNode {
  private node: OctoprintNodeType;
  private httpClient: Axios;

  constructor(node: OctoprintNodeType) {
    this.node = node;
    this.httpClient = new Axios({
      baseURL: `${node.url}:${node.port}`,
    });
    // Verify if the node is reachable
    this.verifyNode();
  }

  private async verifyNode() {
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

class StoreManager {
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
