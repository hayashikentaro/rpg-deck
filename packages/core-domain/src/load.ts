import { parse as parseYaml } from "yaml";
import type { GameProject } from "./model.js";
import { gameProjectSchema } from "./schema.js";

export function parseProjectJson(input: string): GameProject {
  return gameProjectSchema.parse(JSON.parse(input)) as GameProject;
}

export function parseProjectYaml(input: string): GameProject {
  return gameProjectSchema.parse(parseYaml(input)) as GameProject;
}
