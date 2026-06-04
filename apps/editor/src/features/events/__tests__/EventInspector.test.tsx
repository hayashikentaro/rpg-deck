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
          type: "play_bgm",
          bgm: "town_theme"
        },
        {
          type: "play_sfx",
          sfx: "talk"
        },
        {
          type: "show_message",
          speaker: "mayor",
          text: "Welcome to town."
        },
        {
          type: "choice",
          prompt: "Will you help?",
          options: [
            {
              label: "Yes",
              commands: [
                {
                  type: "set_flag",
                  flag: "helping"
                }
              ]
            },
            {
              label: "No",
              commands: []
            }
          ]
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

  it("renders top-level command types", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("Commands");
    expect(html).toContain("play_bgm");
    expect(html).toContain("play_sfx");
    expect(html).toContain("show_message");
    expect(html).toContain("choice");
  });

  it("renders editable show_message fields", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("Speaker");
    expect(html).toContain('value="mayor"');
    expect(html).toContain("Text");
    expect(html).toContain("Welcome to town.");
  });

  it("renders editable audio command fields", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("BGM");
    expect(html).toContain('value="town_theme"');
    expect(html).toContain("SFX");
    expect(html).toContain('value="talk"');
  });

  it("renders choice command as read-only", () => {
    const html = renderInspector("mayor");

    expect(html).toContain("Will you help?");
    expect(html).toContain("Yes");
    expect(html).toContain("No");
    expect(html).toContain("Nested command editing is not available in this phase.");
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
