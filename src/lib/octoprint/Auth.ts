import type { AxiosResponse } from "axios";
import axios from "axios";

export default class AuthorizationWorkflow {
  public baseUrl: string = "";
  public apiKey: string = "";
  public userName: string = "";
  public appName: string = "";
  public appToken: string = "";
  private httpClient;

  constructor(baseUrl: string, userName: string, appName: string) {
    this.baseUrl = baseUrl;
    this.userName = userName;
    this.appName = appName;
    this.httpClient = axios.create({
      baseURL: baseUrl,
    });
  }

  public probeForWorkflow(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get("/plugin/appkeys/probe")
        .then((response: AxiosResponse) => {
          resolve(response.status === 204);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  public requestAuthorization(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .post("/plugin/appkeys/request", {
          app: this.appName,
          user: this.userName,
        })
        .then((response: AxiosResponse) => {
          if (
            response.status === 201 &&
            response.data &&
            response.data.app_token
          ) {
            this.appToken = response.data.app_token;
            resolve(response.headers["Location"]);
          } else {
            reject(new Error("Failed to obtain API key"));
          }
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }
  // see https://docs.octoprint.org/en/master/bundledplugins/appkeys.html#workflow
  public async getApiKey(signal?: AbortSignal): Promise<string> {
    if (!this.appToken) {
      throw new Error(
        "App token is not set. Please request authorization first."
      );
    }
    return new Promise<string>((resolve, reject) => {
      const timer = setInterval(async () => {
        console.log("Checking for API key...");
        if (signal?.aborted) {
          clearInterval(timer);
          reject(new Error("Authorization aborted"));
          return;
        }
        const response = await this.httpClient.get(
          "/plugin/appkeys/request/" + this.appToken
        );
        if (response.status === 202) {
          // Still waiting for user confirmation
          return;
        } else if (response.status === 200 && response.data) {
          // User confirmed, we got the API key
          this.apiKey = response.data.api_key;
          clearInterval(timer);
          resolve(this.apiKey);
        } else if (response.status === 404) {
          resolve("User denied the request");
        }
      }, 1000);
    });
  }
  /* DEPRECATED: Using ratpoison means no popup + needs keyboard to login
  public createWindow(auth_dialog_url: string, signal?: AbortSignal): Window {
    const width = 400;
    const height = 400;
    const left = 100;
    const top = 100;

    const authWindow = window.open(
      auth_dialog_url,
      "auth",
      `resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},top=${top},left=${left}`
    );

    if (!authWindow) {
      throw new Error("Failed to open authorization window.");
    }
    return authWindow;
  }

  public async getApiKey(
    authWindow: Window,
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.appToken) {
      throw new Error(
        "App token is not set. Please request authorization first."
      );
    }

    return new Promise<string>((resolve, reject) => {
      let finished = false;
      const cleanup = () => {
        finished = true;
        clearInterval(timer);
        if (!authWindow.closed) {
          try {
            authWindow.close();
          } catch {}
        }
      };

      // Listen for abort
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            if (!finished) {
              cleanup();
              reject(new Error("Authorization aborted"));
            }
          },
          { once: true }
        );
      }

      const timer = setInterval(async () => {
        if (signal?.aborted) {
          cleanup();
          return;
        }
        if (authWindow.closed) {
          cleanup();
          try {
            const AuthConfirmation = await this.httpClient.get(
              "/plugin/appkeys/request/" + this.appToken
            );

            if (AuthConfirmation.status === 200 && AuthConfirmation.data) {
              this.apiKey = AuthConfirmation.data.api_key;
              resolve(this.apiKey);
            } else {
              reject(new Error("Authorization failed or API key not found."));
            }
          } catch (err) {
            reject(err);
          }
        }
      }, 500);
    });
  }*/
}
