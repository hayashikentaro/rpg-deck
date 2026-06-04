import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GameProject } from "@rpg-deck/core-domain";
import type { RuntimeSnapshot } from "@rpg-deck/web-runtime";
import { PlayablePreview } from "../PlayablePreview.js";

const project: GameProject = {
  id: "preview-test",
  title: "Preview Test",
  settings: {
    tileSize: 16,
    start: {
      map: "test_map",
      position: [0, 0]
    }
  },
  assets: {
    sprites: {},
    tilesets: {},
    audio: {}
  },
  tilesets: {},
  maps: {
    test_map: {
      id: "test_map",
      name: "Test Map",
      size: [4, 3],
      tileset: "test_tiles",
      events: ["npc", "slime"],
      collision: [[1, 0]]
    }
  },
  events: {
    npc: {
      id: "npc",
      map: "test_map",
      position: [2, 0],
      trigger: "interact",
      commands: []
    },
    slime: {
      id: "slime",
      map: "test_map",
      position: [3, 0],
      trigger: "touch",
      commands: []
    }
  },
  actors: {},
  enemies: {},
  items: {},
  skills: {},
  flags: {},
  switches: {},
  variables: {}
};

const snapshot: RuntimeSnapshot = {
  projectId: "preview-test",
  currentMapId: "test_map",
  playerPosition: [0, 0],
  facingDirection: "down",
  status: "idle",
  currentMessage: null,
  currentChoice: null,
  currentBattle: null,
  flags: {},
  currentBgm: null
};

describe("PlayablePreview", () => {
  it("renders current map id", () => {
    expect(renderPreview()).toContain("test_map");
  });

  it("renders player marker", () => {
    expect(renderPreview()).toContain("Player at [0, 0], facing down");
    expect(renderPreview()).toContain(">↓<");
  });

  it("renders collision marker", () => {
    expect(renderPreview()).toContain("Collision at [1, 0]");
    expect(renderPreview()).toContain(">#<");
  });

  it("renders interact event marker", () => {
    expect(renderPreview()).toContain("interact event npc");
    expect(renderPreview()).toContain(">N<");
  });

  it("renders touch event marker", () => {
    expect(renderPreview()).toContain("touch event slime");
    expect(renderPreview()).toContain(">T<");
  });

  it("renders message text when present", () => {
    expect(
      renderPreview({
        ...snapshot,
        status: "message",
        currentMessage: {
          speaker: "npc",
          text: "Hello from the grid."
        }
      })
    ).toContain("Hello from the grid.");
  });

  it("renders choice prompt and options when present", () => {
    const html = renderPreview(
      {
        ...snapshot,
        status: "choice",
        currentChoice: {
          prompt: "Choose a path?",
          options: [
            { index: 0, label: "North" },
            { index: 1, label: "South" }
          ]
        }
      },
      () => undefined
    );

    expect(html).toContain("Choose a path?");
    expect(html).toContain("North");
    expect(html).toContain("South");
    expect(html).toContain("<button");
    expect(html).toContain("Choose North");
  });

  it("renders battle placeholder when present", () => {
    const html = renderPreview({
      ...snapshot,
      status: "battle",
      currentBattle: {
        enemyId: "slime"
      }
    });

    expect(html).toContain("Battle Placeholder");
    expect(html).toContain("Enemy: slime");
  });
});

function renderPreview(nextSnapshot: RuntimeSnapshot = snapshot, onChooseOption?: (optionIndex: number) => void) {
  return renderToStaticMarkup(
    <PlayablePreview project={project} snapshot={nextSnapshot} onChooseOption={onChooseOption} />
  );
}
