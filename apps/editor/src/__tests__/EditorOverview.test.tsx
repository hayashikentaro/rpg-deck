import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProjectSummary } from "@rpg-deck/core-domain";
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

const snapshot: RuntimeSnapshot = {
  projectId: "tiny-rpg",
  currentMapId: "town",
  playerPosition: [4, 6],
  facingDirection: "down",
  status: "idle",
  currentMessage: null,
  currentChoice: null,
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

  it("renders event graph section", () => {
    const html = renderOverview();

    expect(html).toContain("Event graph Mermaid");
    expect(html).toContain("flowchart TD");
  });

  it("renders runtime controls labels", () => {
    const html = renderOverview();

    expect(html).toContain("Up");
    expect(html).toContain("Down");
    expect(html).toContain("Left");
    expect(html).toContain("Right");
    expect(html).toContain("Interact");
  });

  it("renders diff review section", () => {
    const html = renderOverview();

    expect(html).toContain("Diff Review");
  });

  it("renders create proposal button when no proposal exists", () => {
    const html = renderOverview();

    expect(html).toContain("Create mock proposal");
  });

  it("renders proposal title and change count when proposal exists", () => {
    const html = renderOverview(mockProposal);

    expect(html).toContain("Mayor follow-up guidance");
    expect(html).toContain("Changes: 1");
  });

  it("renders proposal review action labels", () => {
    const html = renderOverview(mockProposal);

    expect(html).toContain("Accept");
    expect(html).toContain("Reject");
    expect(html).toContain("Hold");
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

function renderOverview(proposal: ProjectProposal | null = null) {
  return renderToStaticMarkup(
    <EditorOverview
      eventLog={[]}
      mermaid={"flowchart TD\n  map_town[\"Town\"]\n"}
      proposal={proposal}
      projectTitle="Tiny RPG"
      runtimeSnapshot={snapshot}
      summary={summary}
      validationIssues={[]}
      onAcceptProposal={() => undefined}
      onCreateProposal={() => undefined}
      onHoldProposal={() => undefined}
      onRejectProposal={() => undefined}
    />
  );
}
