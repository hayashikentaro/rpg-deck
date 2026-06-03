import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { GameProject } from "@rpg-deck/core-domain";
import { parseProjectJson } from "@rpg-deck/core-domain";
import { createRuntime } from "../runtime.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(currentDir, "../../../sample-projects/tiny-rpg/project.json");

function loadSample(): GameProject {
  return parseProjectJson(readFileSync(samplePath, "utf8"));
}

describe("headless web runtime", () => {
  it("starts new game at sample start map and position", () => {
    const runtime = createRuntime(loadSample());
    runtime.startNewGame();

    expect(runtime.getSnapshot()).toMatchObject({
      projectId: "tiny-rpg",
      currentMapId: "town",
      playerPosition: [4, 6],
      facingDirection: "down",
      status: "idle"
    });
  });

  it("moves player one tile when not blocked", () => {
    const runtime = createRuntime(loadSample());
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "right" });

    expect(runtime.getSnapshot()).toMatchObject({
      playerPosition: [5, 6],
      facingDirection: "right",
      status: "idle"
    });
  });

  it("blocks movement outside map bounds", () => {
    const runtime = createRuntime(projectWithStart([0, 0]));
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "left" });

    expect(runtime.getSnapshot().playerPosition).toEqual([0, 0]);
    expect(runtime.getEventLog()).toContainEqual(expect.objectContaining({ type: "movement_blocked", reason: "blocked" }));
  });

  it("blocks movement into collision tiles", () => {
    const runtime = createRuntime(projectWithStart([0, 1], { collision: [[1, 1]] }));
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "right" });

    expect(runtime.getSnapshot().playerPosition).toEqual([0, 1]);
    expect(runtime.getEventLog()).toContainEqual(expect.objectContaining({ type: "movement_blocked", position: [1, 1] }));
  });

  it("interacting with sample mayor event reaches choice state and updates bgm", () => {
    const runtime = createRuntime(loadSample());
    runtime.startNewGame();
    runtime.dispatch({ type: "move", direction: "right" });
    runtime.dispatch({ type: "move", direction: "right" });

    runtime.dispatch({ type: "interact", direction: "right" });

    expect(runtime.getSnapshot()).toMatchObject({
      status: "choice",
      currentBgm: "town_theme",
      currentChoice: {
        prompt: "それでも行くか？",
        options: [
          { index: 0, label: "行く" },
          { index: 1, label: "やめておく" }
        ]
      }
    });
    expect(runtime.getEventLog()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "message", eventId: "mayor_intro" }),
        expect.objectContaining({ type: "choice", eventId: "mayor_intro" }),
        expect.objectContaining({ type: "sfx_played", assetId: "talk" })
      ])
    );
  });

  it("moving onto a touch event can produce battle state", () => {
    const runtime = createRuntime(projectWithTouchEvent([{ type: "start_battle", enemy: "slime" }]));
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "right" });

    expect(runtime.getSnapshot()).toMatchObject({
      status: "battle",
      currentBattle: { enemyId: "slime" }
    });
    expect(runtime.getEventLog()).toContainEqual(expect.objectContaining({ type: "battle_started", enemyId: "slime" }));
  });

  it("transfer_player command changes current map and position when event is executed", () => {
    const runtime = createRuntime(
      projectWithTouchEvent([
        {
          type: "transfer_player",
          map: "target",
          position: [2, 2]
        }
      ])
    );
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "right" });

    expect(runtime.getSnapshot()).toMatchObject({
      currentMapId: "target",
      playerPosition: [2, 2],
      status: "transferring"
    });
  });

  it("play_bgm updates current bgm", () => {
    const runtime = createRuntime(projectWithTouchEvent([{ type: "play_bgm", bgm: "theme" }]));
    runtime.startNewGame();

    runtime.dispatch({ type: "move", direction: "right" });

    expect(runtime.getSnapshot().currentBgm).toBe("theme");
    expect(runtime.getEventLog()).toContainEqual(expect.objectContaining({ type: "bgm_changed", assetId: "theme" }));
  });

  it("snapshot is serializable", () => {
    const runtime = createRuntime(loadSample());
    runtime.startNewGame();

    expect(() => JSON.stringify(runtime.getSnapshot())).not.toThrow();
  });
});

function projectWithStart(
  start: [number, number],
  mapOverrides: Partial<GameProject["maps"][string]> = {}
): GameProject {
  return {
    ...baseProject(),
    settings: {
      tileSize: 16,
      start: {
        map: "start",
        position: start
      }
    },
    maps: {
      start: {
        id: "start",
        name: "Start",
        size: [3, 3],
        tileset: "basic",
        events: [],
        ...mapOverrides
      }
    }
  };
}

function projectWithTouchEvent(commands: GameProject["events"][string]["commands"]): GameProject {
  const project = projectWithStart([0, 0]);
  return {
    ...project,
    maps: {
      ...project.maps,
      start: {
        ...project.maps.start,
        events: ["touch_event"]
      },
      target: {
        id: "target",
        name: "Target",
        size: [4, 4],
        tileset: "basic",
        events: []
      }
    },
    events: {
      touch_event: {
        id: "touch_event",
        map: "start",
        position: [1, 0],
        trigger: "touch",
        commands
      }
    }
  };
}

function baseProject(): GameProject {
  return {
    id: "runtime-test",
    title: "Runtime Test",
    settings: {
      tileSize: 16,
      start: {
        map: "start",
        position: [0, 0]
      }
    },
    assets: {
      sprites: {},
      tilesets: {
        basic: {
          path: "assets/tilesets/basic.png",
          tileSize: 16
        }
      },
      audio: {
        theme: {
          path: "assets/audio/theme.ogg",
          kind: "bgm"
        }
      }
    },
    tilesets: {
      basic: {
        id: "basic",
        name: "Basic",
        asset: "basic",
        tileSize: 16
      }
    },
    maps: {},
    events: {},
    actors: {},
    enemies: {
      slime: {
        id: "slime",
        name: "Slime"
      }
    },
    items: {},
    skills: {},
    flags: {},
    switches: {},
    variables: {}
  };
}
