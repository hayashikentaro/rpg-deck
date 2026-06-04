import type { EventCommand, EventDefinition, GameProject } from "@rpg-deck/core-domain";

export type EventInspectorProps = {
  project: GameProject;
  selectedEventId: string | null;
  onSelectEvent?: (eventId: string) => void;
  onUpdateEvent?: (eventId: string, updater: (event: EventDefinition) => EventDefinition) => void;
  className?: string;
};

export function EventInspector({
  project,
  selectedEventId,
  onSelectEvent,
  onUpdateEvent,
  className
}: EventInspectorProps) {
  const events = Object.values(project.events);
  const selectedEvent = selectedEventId ? project.events[selectedEventId] : undefined;
  const firstMessageIndex = selectedEvent ? selectedEvent.commands.findIndex((command) => command.type === "show_message") : -1;
  const firstMessage = firstMessageIndex >= 0 ? selectedEvent?.commands[firstMessageIndex] : undefined;

  return (
    <section className={["event-inspector", className].filter(Boolean).join(" ")} aria-label="Event inspector">
      <h2>Event Inspector</h2>
      <div className="event-inspector__layout">
        <div className="event-inspector__list">
          <h3>Events</h3>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <button
                    aria-pressed={event.id === selectedEventId}
                    data-selected={event.id === selectedEventId}
                    type="button"
                    onClick={() => onSelectEvent?.(event.id)}
                  >
                    <strong>{event.id}</strong>
                    <span>{event.map}</span>
                    <span>[{event.position.join(", ")}]</span>
                    <span>{event.trigger}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events in this project.</p>
          )}
        </div>
        <div className="event-inspector__fields">
          {selectedEvent ? (
            <>
              <h3>{selectedEvent.id}</h3>
              <label>
                Position X
                <input
                  type="number"
                  value={selectedEvent.position[0]}
                  onChange={(event) =>
                    updateSelectedEvent(onUpdateEvent, selectedEvent.id, (current) => ({
                      ...current,
                      position: [Number(event.target.value), current.position[1]]
                    }))
                  }
                />
              </label>
              <label>
                Position Y
                <input
                  type="number"
                  value={selectedEvent.position[1]}
                  onChange={(event) =>
                    updateSelectedEvent(onUpdateEvent, selectedEvent.id, (current) => ({
                      ...current,
                      position: [current.position[0], Number(event.target.value)]
                    }))
                  }
                />
              </label>
              <label>
                Trigger
                <select
                  value={selectedEvent.trigger}
                  onChange={(event) =>
                    updateSelectedEvent(onUpdateEvent, selectedEvent.id, (current) => ({
                      ...current,
                      trigger: event.target.value as EventDefinition["trigger"]
                    }))
                  }
                >
                  <option value="interact">interact</option>
                  <option value="touch">touch</option>
                  <option value="autorun">autorun</option>
                </select>
              </label>
              <label>
                Sprite ID
                <input
                  type="text"
                  value={selectedEvent.sprite ?? ""}
                  onChange={(event) =>
                    updateSelectedEvent(onUpdateEvent, selectedEvent.id, (current) => ({
                      ...current,
                      sprite: event.target.value || undefined
                    }))
                  }
                />
              </label>
              {firstMessage?.type === "show_message" ? (
                <label>
                  First show_message text
                  <textarea
                    value={firstMessage.text}
                    onChange={(event) =>
                      updateSelectedEvent(onUpdateEvent, selectedEvent.id, (current) => ({
                        ...current,
                        commands: replaceCommandText(current.commands, firstMessageIndex, event.target.value)
                      }))
                    }
                  />
                </label>
              ) : (
                <p>No show_message command in this event.</p>
              )}
            </>
          ) : (
            <p>Select an event to inspect.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function updateSelectedEvent(
  onUpdateEvent: EventInspectorProps["onUpdateEvent"],
  eventId: string,
  updater: (event: EventDefinition) => EventDefinition
) {
  onUpdateEvent?.(eventId, updater);
}

function replaceCommandText(commands: EventCommand[], commandIndex: number, text: string): EventCommand[] {
  return commands.map((command, index) => {
    if (index !== commandIndex || command.type !== "show_message") return command;
    return {
      ...command,
      text
    };
  });
}
