// same as movement API

import type { Axios } from "axios";

import { OctoprintAPI } from "./OctoprintAPI";

export default class ToolAPI extends OctoprintAPI {
  constructor(httpClient: Axios) {
    super(httpClient);
  }
}
