import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GameProject } from "../model.js";
import { parseProjectJson } from "../load.js";
import { gameProjectSchema } from "../schema.js";
import { validateProject } from "../validation.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(currentDir, "../../../sample-projects/tiny-rpg/project.json");

function loadSample(): GameProject {
  return parseProjectJson(readFileSync(samplePath, "utf8"));
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
        path: "events.mayor_intro.commands.3.map"
      })
    );
  });
});
