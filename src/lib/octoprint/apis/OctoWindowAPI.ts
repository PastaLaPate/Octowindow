/*
NOTE: API Used to interact with the local backend server to shutdown the host and use the bonjour discovery service. This API is not used in the frontend, but is used in the backend to interact with the local server.
*/

import axios, { Axios } from "axios";
import { t } from "i18next";
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
        toast.error(t("errors.E0006"));
      }
    } catch (error) {
      throw new Error(
        "Local API is not reachable. Please ensure the local server is running."
      );
    }
  }

  public async checkForUpdates(): Promise<void> {
    const currentVersion = this.version;
    const response = await fetch(
      "https://api.github.com/repos/PastaLaPate/Octowindow/releases/latest"
    );
    const data = await response.json();
    const latestVersion = data.tag_name;
    if (gt(latestVersion, currentVersion)) {
      toast.info(
        t("infos.update_available", {
          latestVersion: latestVersion,
          currentVersion: currentVersion,
        }),
        {
          duration: 10000,
          action: {
            label: "Update",
            onClick: () => {
              toast.warning(t("infos.update_confirmation"), {
                duration: 15000,
                action: {
                  label: "Continue",
                  onClick: () => {
                    this.update();
                  },
                },
                cancel: {
                  label: "Cancel",
                  onClick: () => {
                    toast.info(t("infos.update_cancel"));
                  },
                },
              });
            },
          },
        }
      );
    } else {
      toast.success(t("infos.latest_release"));
    }
  }

  public async update(): Promise<void> {
    try {
      const response = await this.httpClient.post("/update");
      if (response.status === 200) {
        toast.success(t("infos.update"));
      } else {
        throw new Error("Failed to initiate update process.");
      }
    } catch (error) {
      error instanceof Error
        ? toast.error(t("errors.E0007", { error: error.message }))
        : toast.error(
            t("errors.E0007", { error: "An unknown error occurred" })
          );
    }
  }

  public async getBackendStatus(): Promise<LocalBackendStatus> {
    try {
      await this.testAPI();
      return {
        connected: true,
        message: t("topbar.status.backend_operational"),
      };
    } catch (error) {
      return {
        connected: false,
        message: t("topbar.status.backend_disconnected"),
      };
    }
  }

  public async shutdownHost(): Promise<void> {
    const resp = await this.httpClient.post("/shutdown");
    if (resp.status === 500) {
      toast.error(t("errors.E0008"));
    } else {
      toast.info(t("infos.shutdown"));
    }
  }

  private async discoverOctoprintNodes(): Promise<string[]> {
    const response = await this.httpClient.get<string[]>("/api/bonjour");
    return response.data;
  }
}
