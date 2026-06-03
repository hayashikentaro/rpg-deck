import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEventGraph, parseProjectJson, summarizeProject, validateProject } from "../index.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(currentDir, "../../../sample-projects/tiny-rpg/project.json");
const project = parseProjectJson(readFileSync(samplePath, "utf8"));
const issues = validateProject(project);
const summary = summarizeProject(project);
const graph = buildEventGraph(project);

console.log(JSON.stringify({ summary, graph }, null, 2));

for (const issue of issues) {
  const prefix = issue.severity.toUpperCase();
  console.error(`${prefix} ${issue.code} ${issue.path}: ${issue.message}`);
}

if (issues.some((issue) => issue.severity === "error")) {
  process.exit(1);
}
