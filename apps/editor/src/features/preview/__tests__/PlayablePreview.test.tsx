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
  canAdvance: false,
  currentBattle: null,
  flags: {},
  currentBgm: null
};

describe("PlayablePreview", () => {
  it("renders current map id", () => {
    expect(renderPreview()).toContain("test_map");
  });

  it("renders marker legend", () => {
    const html = renderPreview();

    expect(html).toContain("Legend");
    expect(html).toContain("Player facing");
    expect(html).toContain("Interact event");
    expect(html).toContain("Touch event");
    expect(html).toContain("Autorun event");
    expect(html).toContain("Collision");
    expect(html).toContain("Empty");
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
        },
        canAdvance: true
      })
    ).toContain("Hello from the grid.");
  });

  it("renders Continue when the current message can advance", () => {
    const html = renderPreview(
      {
        ...snapshot,
        status: "message",
        currentMessage: {
          text: "Continue this message."
        },
        canAdvance: true
      },
      undefined,
      () => undefined
    );

    expect(html).toContain("Continue this message.");
    expect(html).toContain(">Continue<");
  });

  it("does not render Continue when the current message cannot advance", () => {
    const html = renderPreview({
      ...snapshot,
      status: "message",
      currentMessage: {
        text: "Read-only message."
      },
      canAdvance: false
    });

    expect(html).toContain("Read-only message.");
    expect(html).not.toContain(">Continue<");
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

  it("keeps read-only grid cells without cell controls", () => {
    const html = renderPreview();

    expect(html).toContain("Player at [0, 0], facing down");
    expect(html).not.toContain("playable-preview__cell-button");
  });

  it("renders clickable cell controls with position and cell labels", () => {
    const html = renderPreview(snapshot, undefined, undefined, () => undefined);

    expect(html).toContain("playable-preview__cell-button");
    expect(html).toContain("Move selected event to [0, 0]. Player at [0, 0], facing down");
    expect(html).toContain("Move selected event to [2, 0]. interact event npc at [2, 0]");
  });

  it("marks the selected event in read-only rendering", () => {
    const html = renderPreview(snapshot, undefined, undefined, undefined, "npc");

    expect(html).toContain('data-selected="true"');
    expect(html).toContain("interact event npc at [2, 0], selected");
    expect(html).not.toContain("playable-preview__cell-button");
  });

  it("marks the selected event cell button in clickable rendering", () => {
    const html = renderPreview(snapshot, undefined, undefined, () => undefined, "npc");

    expect(html).toContain('class="playable-preview__cell-button" data-selected="true"');
    expect(html).toContain("Move selected event to [2, 0]. interact event npc at [2, 0], selected");
  });

  it("uses event selection for event cells and movement for non-event cells", () => {
    const html = renderPreview(snapshot, undefined, undefined, () => undefined, "npc", () => undefined);

    expect(html).toContain("Select event npc. interact event npc at [2, 0], selected");
    expect(html).toContain("Move selected event to [0, 0]. Player at [0, 0], facing down");
    expect(html).not.toContain("Move selected event to [2, 0]. interact event npc");
  });

  it("uses collision action labels when collision toggle mode is active", () => {
    const html = renderPreview(snapshot, undefined, undefined, () => undefined, "npc", undefined, "toggle_collision");

    expect(html).toContain("Toggle collision at [0, 0]. Player at [0, 0], facing down");
    expect(html).toContain("Toggle collision at [1, 0]. Collision at [1, 0]");
    expect(html).toContain("Toggle collision at [2, 0]. interact event npc at [2, 0], selected");
  });
});

function renderPreview(
  nextSnapshot: RuntimeSnapshot = snapshot,
  onChooseOption?: (optionIndex: number) => void,
  onAdvance?: () => void,
  onCellClick?: (position: [number, number]) => void,
  selectedEventId?: string | null,
  onEventClick?: (eventId: string) => void,
  cellClickAction?: "move_selected_event" | "toggle_collision"
) {
  return renderToStaticMarkup(
    <PlayablePreview
      project={project}
      snapshot={nextSnapshot}
      onAdvance={onAdvance}
      onCellClick={onCellClick}
      onChooseOption={onChooseOption}
      onEventClick={onEventClick}
      cellClickAction={cellClickAction}
      selectedEventId={selectedEventId}
    />
  );
}
