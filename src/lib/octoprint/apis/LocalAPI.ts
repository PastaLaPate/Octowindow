/*
NOTE: API Used to interact with the local backend server to shutdown the host and use the bonjour discovery service. This API is not used in the frontend, but is used in the backend to interact with the local server.
*/

import axios, { Axios } from "axios";

import { OctoprintAPI } from "./OctoprintAPI";

export class LocalAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    // Use a custom base URL for the local API
    super(httpClient);
    this.httpClient = new Axios({
      baseURL: "http://localhost:3000/api/", // On dev vite will proxy this to the backend server
      transformRequest: axios.defaults.transformRequest,
      transformResponse: axios.defaults.transformResponse,
    });
  }

  public async shutdownHost(): Promise<void> {
    await this.httpClient.post("/api/local/shutdown");
  }

  public async restartHost(): Promise<void> {
    await this.httpClient.post("/api/local/restart");
  }

  public async discoverOctoprintNodes(): Promise<string[]> {
    const response = await this.httpClient.get<string[]>("/api/local/discover");
    return response.data;
  }
}
