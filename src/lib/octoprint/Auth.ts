import axios, { AxiosResponse } from "axios";

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

  public probeForWorkflow() {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get("/plugin/appkeys/probe")
        .then((response: AxiosResponse) => {
          resolve(response.status === 204);
        })
        .catch((error: any) => {
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
            response.data.app_token &&
            response.data.auth_dialog
          ) {
            this.appToken = response.data.app_token;
            resolve(response.data.auth_dialog);
          } else {
            reject(new Error("Failed to obtain API key"));
          }
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
  public async getApiKey(auth_dialog_url: string): Promise<string> {
    if (!this.appToken) {
      throw new Error(
        "App token is not set. Please request authorization first."
      );
    }

    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authWindow = window.open(
      auth_dialog_url,
      "auth",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!authWindow) {
      throw new Error("Failed to open authorization window.");
    }

    return new Promise<string>((resolve, reject) => {
      const timer = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(timer);
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
  }
}
