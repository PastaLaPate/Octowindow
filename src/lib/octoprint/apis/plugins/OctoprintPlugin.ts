import type { Axios } from "axios";
import axios from "axios";
import urlJoin from "url-join";

import { OctoprintAPI } from "../OctoprintAPI";

export class OctoprintPluginAPI extends OctoprintAPI {
  private pluginName: string;
  private octoprintBaseURL: string;

  constructor(httpClient: Axios, pluginName: string) {
    super(httpClient);
    this.octoprintBaseURL = httpClient.defaults.baseURL!;
    this.httpClient = axios.create({
      ...httpClient.defaults,
      baseURL: urlJoin(httpClient.defaults.baseURL!, "/plugin/" + pluginName),
    });
    this.pluginName = pluginName;
  }

  public async isInstalled(): Promise<boolean> {
    const resp = await axios.get(
      urlJoin(this.octoprintBaseURL, "/api/plugin/", this.pluginName)
    );
    return resp.status === 204;
  }
}
