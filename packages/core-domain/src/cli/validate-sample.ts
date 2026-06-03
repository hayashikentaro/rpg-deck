import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEventGraph, eventGraphToMermaid, parseProjectJson, summarizeProject, validateProject } from "../index.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(currentDir, "../../../sample-projects/tiny-rpg/project.json");
const project = parseProjectJson(readFileSync(samplePath, "utf8"));
const issues = validateProject(project);
const summary = summarizeProject(project);
const graph = buildEventGraph(project);

console.log("Summary");
console.log(JSON.stringify(summary, null, 2));
console.log("");
console.log(`Event graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
console.log("");
console.log("Mermaid");
console.log(eventGraphToMermaid(graph));

if (issues.length > 0) {
  console.error("Validation issues");
  for (const issue of issues) {
    const prefix = issue.severity.toUpperCase();
    console.error(`${prefix} ${issue.code} ${issue.path}: ${issue.message}`);
  }
}

if (issues.some((issue) => issue.severity === "error")) {
  process.exit(1);
}
