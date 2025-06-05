import type { Axios } from "axios";

export interface IOctoprintAPI {
  httpClient: Axios;
}

export class OctoprintAPI implements IOctoprintAPI {
  public httpClient: Axios;
  constructor(httpClienta: Axios) {
    this.httpClient = httpClienta;
  }
}
