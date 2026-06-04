import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GameProject, ProjectSummary } from "@rpg-deck/core-domain";
import type { RuntimeSnapshot } from "@rpg-deck/web-runtime";
import { EditorOverview } from "../EditorOverview.js";
import type { ProjectProposal } from "../proposals.js";

const summary: ProjectSummary = {
  id: "tiny-rpg",
  title: "Tiny RPG",
  startMap: "town",
  startPosition: [4, 6],
  counts: {
    maps: 2,
    events: 2,
    actors: 1,
    enemies: 1,
    items: 1,
    skills: 1,
    flags: 2,
    switches: 1,
    variables: 1
  }
};

const project: GameProject = {
  id: "tiny-rpg",
  title: "Tiny RPG",
  settings: {
    tileSize: 16,
    start: {
      map: "town",
      position: [4, 6]
    }
  },
  assets: {
    sprites: {},
    tilesets: {},
    audio: {}
  },
  tilesets: {},
  maps: {
    town: {
      id: "town",
      name: "Town",
      size: [10, 8],
      tileset: "town_tiles",
      events: ["mayor_intro"],
      collision: [[1, 1]]
    }
  },
  events: {
    mayor_intro: {
      id: "mayor_intro",
      map: "town",
      position: [7, 6],
      trigger: "interact",
      commands: [
        {
          type: "show_message",
          text: "Welcome to Tiny RPG."
        }
      ]
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
  projectId: "tiny-rpg",
  currentMapId: "town",
  playerPosition: [4, 6],
  facingDirection: "down",
  status: "idle",
  currentMessage: null,
  currentChoice: null,
  canAdvance: false,
  currentBattle: null,
  flags: {},
  currentBgm: null
};

describe("EditorOverview", () => {
  it("renders project title", () => {
    expect(renderOverview()).toContain("Tiny RPG");
  });

  it("renders summary counts", () => {
    const html = renderOverview();

    expect(html).toContain("Maps");
    expect(html).toContain("Events");
    expect(html).toContain("Flags");
  });

  it("renders validation section", () => {
    const html = renderOverview();

    expect(html).toContain("Validation issues");
    expect(html).toContain("No validation issues.");
  });

  it("renders runtime snapshot section", () => {
    const html = renderOverview();

    expect(html).toContain("Runtime snapshot");
    expect(html).toContain("&quot;currentMapId&quot;");
  });

  it("renders playable grid preview section", () => {
    const html = renderOverview();

    expect(html).toContain("Playable Grid Preview");
    expect(html).toContain("Map edit mode");
    expect(html).toContain("Move event");
    expect(html).toContain("Toggle collision");
    expect(html).toContain('data-active="true"');
    expect(html).toContain("Move event mode: click an event marker to select it. Click another cell to move the selected event.");
    expect(html).toContain("Authoring Status");
    expect(html).toContain("Map edit mode");
    expect(html).toContain("Selected event");
    expect(html).toContain("mayor_intro");
    expect(html).toContain("Grid click action");
    expect(html).toContain("event marker selects that event; another cell moves the selected event");
    expect(html).toContain("Runtime Status");
    expect(html).toContain("↓");
    expect(html).toContain("Player at [4, 6], facing down");
  });

  it("renders event inspector and selected event id", () => {
    const html = renderOverview();

    expect(html).toContain("Event Inspector");
    expect(html).toContain("<h3>mayor_intro</h3>");
    expect(html).toContain("interact event mayor_intro at [7, 6], selected");
    expect(html).toContain("Select event mayor_intro. interact event mayor_intro at [7, 6], selected");
    expect(html).toContain('data-selected="true"');
  });

  it("renders collision mode hint and action labels", () => {
    const html = renderOverview(null, snapshot, null, "toggle_collision");

    expect(html).toContain("Collision mode: click a grid cell to add or remove collision.");
    expect(html).toContain("Toggle collision");
    expect(html).toContain("click any cell to add or remove collision");
    expect(html).toContain("Toggle collision at [4, 6]. Player at [4, 6], facing down");
  });

  it("renders event graph section", () => {
    const html = renderOverview();

    expect(html).toContain("Event graph Mermaid");
    expect(html).toContain("flowchart TD");
  });

  it("renders runtime controls labels", () => {
    const html = renderOverview();

    expect(html).toContain("Runtime controls");
    expect(html).toContain("Up");
    expect(html).toContain("Down");
    expect(html).toContain("Left");
    expect(html).toContain("Right");
    expect(html).toContain("Interact");
    expect(html).toContain("Restart");
    expect(html).toContain("Arrow keys / WASD move, Space or Enter advances messages or interacts, R restarts.");
  });

  it("renders current choice options in the playable preview", () => {
    const html = renderOverview(null, {
      ...snapshot,
      status: "choice",
      currentChoice: {
        prompt: "Choose a path?",
        options: [
          { index: 0, label: "North" },
          { index: 1, label: "South" }
        ]
      }
    });

    expect(html).toContain("Choose a path?");
    expect(html).toContain("North");
    expect(html).toContain("South");
  });

  it("renders Continue for an advanceable runtime message", () => {
    const html = renderOverview(null, {
      ...snapshot,
      status: "message",
      currentMessage: {
        text: "Advance this message."
      },
      canAdvance: true
    });

    expect(html).toContain("Advance this message.");
    expect(html).toContain(">Continue<");
  });

  it("renders diff review section", () => {
    const html = renderOverview();

    expect(html).toContain("Diff Review");
    expect(html).toContain("Confirm accepted changes in Event Inspector and Playable Preview.");
  });

  it("renders create proposal button when no proposal exists", () => {
    const html = renderOverview();

    expect(html).toContain("Create mock proposal");
  });

  it("renders proposal title and change count when proposal exists", () => {
    const html = renderOverview(mockProposal);

    expect(html).toContain("Mayor follow-up guidance");
    expect(html).toContain("Changes: 1");
    expect(html).toContain("Proposal status: active");
  });

  it("renders proposal review action labels", () => {
    const html = renderOverview(mockProposal);

    expect(html).toContain("Accept");
    expect(html).toContain("Reject");
    expect(html).toContain("Hold");
  });

  it("renders held proposal status", () => {
    const html = renderOverview({
      ...mockProposal,
      status: "held"
    });

    expect(html).toContain("Proposal status: held");
  });

  it("renders proposal confirmation notice", () => {
    const html = renderOverview(null, snapshot, "Accepted proposal applied. Confirm the updated event.");

    expect(html).toContain("Accepted proposal applied. Confirm the updated event.");
  });
});

const mockProposal: ProjectProposal = {
  id: "mock",
  title: "Mayor follow-up guidance",
  summary: "Updates one dialogue line.",
  status: "active",
  beforeProject: {} as ProjectProposal["beforeProject"],
  afterProject: {} as ProjectProposal["afterProject"],
  diff: {
    beforeProjectId: "tiny-rpg",
    afterProjectId: "tiny-rpg",
    changes: [
      {
        type: "changed",
        entityType: "event",
        entityId: "mayor_intro",
        path: "events.mayor_intro",
        before: { text: "old" },
        after: { text: "new" }
      }
    ]
  }
};

function renderOverview(
  proposal: ProjectProposal | null = null,
  runtimeSnapshot: RuntimeSnapshot = snapshot,
  proposalNotice: string | null = null,
  mapEditMode: "move_event" | "toggle_collision" = "move_event"
) {
  return renderToStaticMarkup(
    <EditorOverview
      eventLog={[]}
      mermaid={"flowchart TD\n  map_town[\"Town\"]\n"}
      proposal={proposal}
      proposalNotice={proposalNotice}
      mapEditMode={mapEditMode}
      project={project}
      projectTitle="Tiny RPG"
      runtimeSnapshot={runtimeSnapshot}
      selectedEventId="mayor_intro"
      summary={summary}
      validationIssues={[]}
      onAcceptProposal={() => undefined}
      onAdvance={() => undefined}
      onCreateProposal={() => undefined}
      onHoldProposal={() => undefined}
      onChooseOption={() => undefined}
      onMapEditModeChange={() => undefined}
      onMoveSelectedEvent={() => undefined}
      onRejectProposal={() => undefined}
      onSelectEvent={() => undefined}
      onToggleCollision={() => undefined}
      onUpdateEvent={() => undefined}
    />
  );
}
