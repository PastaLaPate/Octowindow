/*
NOTE: API Used to interact with the local backend server to shutdown the host and use the bonjour discovery service. This API is not used in the frontend, but is used in the backend to interact with the local server.
*/

import axios, { Axios } from "axios";
import { gt } from "semver";
import { toast } from "sonner";

import { OctoprintAPI } from "./OctoprintAPI";

export type LocalBackendStatus = {
  connected: boolean;
  message: string;
};

export class OctoWindowAPI extends OctoprintAPI {
  public version: string = "dev";

  constructor(httpClient: Axios) {
    // Use a custom base URL for the local API
    super(httpClient);
    this.version = __APP_VERSION__ === "000.000.000" ? "dev" : __APP_VERSION__;
    this.httpClient = new Axios({
      baseURL: "http://localhost:3000/api/", // On dev vite will proxy this to the backend server
      transformRequest: axios.defaults.transformRequest,
      transformResponse: axios.defaults.transformResponse,
    });
  }

  public async testAPI(): Promise<void> {
    try {
      const resp = await this.httpClient.get("/ping");
      if (resp.data.message !== "pong") {
        throw new Error("Unexpected response from local API");
      }
      if (resp.data.version !== this.version) {
        toast.error(
          "Frontend and backend versions do not match. This can break the app. Please update the frontend or backend to the same version.",
        );
      }
    } catch (error) {
      throw new Error(
        "Local API is not reachable. Please ensure the local server is running.",
      );
    }
  }

  public async checkForUpdates(): Promise<void> {
    const currentVersion = "0.0.0"; //this.version
    const response = await fetch(
      "https://api.github.com/repos/PastaLaPate/Octowindow/releases/latest",
    );
    const data = await response.json();
    const latestVersion = data.tag_name;
    if (gt(latestVersion, currentVersion)) {
      toast.info(
        `A new version of OctoWindow is available: ${latestVersion}. Current : ${currentVersion}`,
        {
          duration: 30000,
          action: {
            label: "Update",
            onClick: () => {},
          },
        },
      );
    } else {
      toast.success("You are using the latest version of OctoWindow.");
    }
  }

  public async getBackendStatus(): Promise<LocalBackendStatus> {
    try {
      await this.testAPI();
      return {
        connected: true,
        message: "Local backend is Operational",
      };
    } catch (error) {
      return {
        connected: false,
        message:
          "Local backend is not reachable. Please ensure the local server is running.",
      };
    }
  }

  public async shutdownHost(): Promise<void> {
    const resp = await this.httpClient.post("/shutdown");
    if (resp.status === 500) {
      throw new Error("Failed to shutdown the host. Please try again later.");
    }
  }

  private async discoverOctoprintNodes(): Promise<string[]> {
    const response = await this.httpClient.get<string[]>("/api/local/discover");
    return response.data;
  }
}
