import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProjectSummary } from "@rpg-deck/core-domain";
import type { RuntimeSnapshot } from "@rpg-deck/web-runtime";
import { EditorOverview } from "../EditorOverview.js";

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
});

function renderOverview() {
  return renderToStaticMarkup(
    <EditorOverview
      eventLog={[]}
      mermaid={"flowchart TD\n  map_town[\"Town\"]\n"}
      projectTitle="Tiny RPG"
      runtimeSnapshot={snapshot}
      summary={summary}
      validationIssues={[]}
    />
  );
}
