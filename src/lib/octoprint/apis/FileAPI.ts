import { OctoprintAPI } from "./OctoprintAPI";

export type Node = {
  name: string;
  size: string; // Size like 10 MB
  path: string;
};

export type Dir = Node & {
  children: Node[];
};

export type Print = Node & {
  display: string;
  thumbnail: string; // Thumbnail URL
};

export class FileAPI extends OctoprintAPI {
  public async getFiles() {}
}
