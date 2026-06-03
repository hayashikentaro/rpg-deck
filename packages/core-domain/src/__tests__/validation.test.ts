import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GameProject } from "../model.js";
import { diffProjects } from "../diff.js";
import { buildEventGraph } from "../graph.js";
import { parseProjectJson } from "../load.js";
import { eventGraphToMermaid } from "../mermaid.js";
import { gameProjectSchema } from "../schema.js";
import { validateProject } from "../validation.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(currentDir, "../../../sample-projects/tiny-rpg/project.json");

function loadSample(): GameProject {
  return parseProjectJson(readFileSync(samplePath, "utf8"));
}

function cloneProject(project: GameProject): GameProject {
  return JSON.parse(JSON.stringify(project)) as GameProject;
}

describe("validateProject", () => {
  it("accepts the tiny-rpg sample", () => {
    const issues = validateProject(loadSample());
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("reports a missing start map", () => {
    const project = loadSample();
    project.settings.start.map = "missing";

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        code: "missing_start_map",
        path: "settings.start.map"
      })
    );
  });

  it("reports a missing map tileset", () => {
    const project = loadSample();
    project.maps.town.tileset = "missing_tileset";

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        code: "missing_tileset",
        path: "maps.town.tileset"
      })
    );
  });

  it("reports map event membership mismatches", () => {
    const project = loadSample();
    project.maps.town.events.push("cave_slime");

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        code: "map_event_mismatch",
        path: "maps.town.events"
      })
    );
  });

  it("reports an event outside map bounds", () => {
    const project = loadSample();
    project.events.mayor_intro.position = [99, 99];

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        code: "event_outside_map",
        path: "events.mayor_intro.position"
      })
    );
  });

  it("rejects an unknown command type at schema validation", () => {
    const project = loadSample() as unknown as Record<string, unknown>;
    const events = project.events as Record<string, { commands: unknown[] }>;
    events.mayor_intro.commands.push({ type: "script", source: "showMessage('bad')" });

    const result = gameProjectSchema.safeParse(project);
    expect(result.success).toBe(false);
  });

  it("rejects choice commands with zero options", () => {
    const project = loadSample() as unknown as Record<string, unknown>;
    const events = project.events as Record<string, { commands: unknown[] }>;
    events.mayor_intro.commands.push({ type: "choice", prompt: "Empty?", options: [] });

    const result = gameProjectSchema.safeParse(project);
    expect(result.success).toBe(false);
  });

  it("warns when show_message uses an unknown speaker", () => {
    const project = loadSample();
    project.events.mayor_intro.commands.push({
      type: "show_message",
      speaker: "unknown_speaker",
      text: "..."
    });

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        code: "unknown_message_speaker",
        path: "events.mayor_intro.commands.4.speaker"
      })
    );
  });

  it("reports transfer_player to a missing map", () => {
    const project = loadSample();
    project.events.mayor_intro.commands.push({
      type: "transfer_player",
      map: "missing_map",
      position: [1, 1]
    });

    expect(validateProject(project)).toContainEqual(
      expect.objectContaining({
        code: "missing_transfer_map",
        path: "events.mayor_intro.commands.4.map"
      })
    );
  });

  it("diffProjects detects added, removed, and changed events", () => {
    const before = loadSample();
    const after = cloneProject(before);
    delete after.events.cave_slime;
    after.events.mayor_intro = {
      ...after.events.mayor_intro,
      position: [8, 6]
    };
    after.events.new_hint = {
      id: "new_hint",
      map: "town",
      position: [2, 2],
      trigger: "interact",
      commands: [{ type: "show_message", text: "A new hint." }]
    };

    const diff = diffProjects(before, after);

    expect(diff.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "removed", entityType: "event", entityId: "cave_slime" }),
        expect.objectContaining({ type: "changed", entityType: "event", entityId: "mayor_intro" }),
        expect.objectContaining({ type: "added", entityType: "event", entityId: "new_hint" })
      ])
    );
  });

  it("eventGraphToMermaid returns a flowchart with expected nodes and edges", () => {
    const mermaid = eventGraphToMermaid(buildEventGraph(loadSample()));

    expect(mermaid.startsWith("flowchart TD\n")).toBe(true);
    expect(mermaid).toContain('map_town["Town"]');
    expect(mermaid).toContain('event_mayor_intro["mayor_intro"]');
    expect(mermaid).toContain("map_town --> event_mayor_intro");
  });

  it("sample event graph includes transfer and battle edges", () => {
    const graph = buildEventGraph(loadSample());

    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "transfer", to: "map:cave_entrance" }),
        expect.objectContaining({ type: "battle", to: "battle:slime" })
      ])
    );
  });
});
