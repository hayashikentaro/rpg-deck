import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GameProject } from "@rpg-deck/core-domain";
import { EventInspector } from "../EventInspector.js";

const project: GameProject = {
  id: "event-inspector-test",
  title: "Event Inspector Test",
  settings: {
    tileSize: 16,
    start: {
      map: "town",
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
    town: {
      id: "town",
      name: "Town",
      size: [10, 10],
      tileset: "town_tiles",
      events: ["mayor", "silent_marker"]
    }
  },
  events: {
    mayor: {
      id: "mayor",
      map: "town",
      position: [2, 3],
      sprite: "mayor",
      trigger: "interact",
      commands: [
        {
          type: "show_message",
          text: "Welcome to town."
        }
      ]
    },
    silent_marker: {
      id: "silent_marker",
      map: "town",
      position: [4, 5],
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

describe("EventInspector", () => {
  it("renders event list", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("mayor");
    expect(html).toContain("silent_marker");
  });

  it("renders selected event id", () => {
    expect(renderInspector("mayor")).toContain("<h3>mayor</h3>");
  });

  it("renders position fields", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("Position X");
    expect(html).toContain("Position Y");
    expect(html).toContain('value="2"');
    expect(html).toContain('value="3"');
  });

  it("renders trigger select options", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("Trigger");
    expect(html).toContain('value="interact"');
    expect(html).toContain('value="touch"');
    expect(html).toContain('value="autorun"');
  });

  it("renders first show_message text when present", () => {
    expect(renderInspector("mayor")).toContain("Welcome to town.");
  });

  it("renders no-message note when selected event has no show_message", () => {
    expect(renderInspector("silent_marker")).toContain("No show_message command in this event.");
  });
});

function renderInspector(selectedEventId: string) {
  return renderToStaticMarkup(
    <EventInspector
      project={project}
      selectedEventId={selectedEventId}
      onSelectEvent={() => undefined}
      onUpdateEvent={() => undefined}
    />
  );
}
