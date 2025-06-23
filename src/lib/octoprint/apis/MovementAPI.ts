import type { Axios } from "axios";

import { OctoprintAPI } from "./OctoprintAPI";

// Well actually it should be in Printer API but then printer api would be too BIG so i put it here
export default class MovementAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    super(httpClient);
  }
}
