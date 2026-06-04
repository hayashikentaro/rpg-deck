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
              <section className="event-inspector__commands" aria-label="Event commands">
                <h4>Commands</h4>
                {selectedEvent.commands.length > 0 ? (
                  <ol className="event-inspector__command-list">
                    {selectedEvent.commands.map((command, commandIndex) => (
                      <li className="event-inspector__command" key={`${selectedEvent.id}-${commandIndex}`}>
                        <div className="event-inspector__command-header">
                          <strong>#{commandIndex}</strong>
                          <code>{command.type}</code>
                        </div>
                        {renderCommandEditor(command, commandIndex, selectedEvent.id, onUpdateEvent)}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>No commands in this event.</p>
                )}
                {!selectedEvent.commands.some((command) => command.type === "show_message") ? (
                  <p>No show_message command in this event.</p>
                ) : null}
              </section>
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

function updateEventCommand(
  onUpdateEvent: EventInspectorProps["onUpdateEvent"],
  eventId: string,
  commandIndex: number,
  updater: (command: EventCommand) => EventCommand
) {
  updateSelectedEvent(onUpdateEvent, eventId, (event) => ({
    ...event,
    commands: event.commands.map((command, index) => (index === commandIndex ? updater(command) : command))
  }));
}

function renderCommandEditor(
  command: EventCommand,
  commandIndex: number,
  eventId: string,
  onUpdateEvent: EventInspectorProps["onUpdateEvent"]
) {
  const commandType: string = command.type;

  switch (command.type) {
    case "show_message":
      return (
        <div className="event-inspector__command-fields">
          <label>
            Speaker
            <input
              type="text"
              value={command.speaker ?? ""}
              onChange={(event) =>
                updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
                  current.type === "show_message"
                    ? {
                        ...current,
                        speaker: event.target.value || undefined
                      }
                    : current
                )
              }
            />
          </label>
          <label>
            Text
            <textarea
              value={command.text}
              onChange={(event) =>
                updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
                  current.type === "show_message"
                    ? {
                        ...current,
                        text: event.target.value
                      }
                    : current
                )
              }
            />
          </label>
        </div>
      );

    case "play_bgm":
      return renderTextCommandField("BGM", command.bgm, (value) =>
        updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
          current.type === "play_bgm" ? { ...current, bgm: value } : current
        )
      );

    case "play_sfx":
      return renderTextCommandField("SFX", command.sfx, (value) =>
        updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
          current.type === "play_sfx" ? { ...current, sfx: value } : current
        )
      );

    case "set_flag":
    case "unset_flag":
      return renderTextCommandField("Flag", command.flag, (value) =>
        updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
          current.type === command.type ? { ...current, flag: value } : current
        )
      );

    case "transfer_player":
      return (
        <div className="event-inspector__command-fields">
          <label>
            Map
            <input
              type="text"
              value={command.map}
              onChange={(event) =>
                updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
                  current.type === "transfer_player" ? { ...current, map: event.target.value } : current
                )
              }
            />
          </label>
          <label>
            Position X
            <input
              type="number"
              value={command.position[0]}
              onChange={(event) =>
                updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
                  current.type === "transfer_player"
                    ? { ...current, position: [Number(event.target.value), current.position[1]] }
                    : current
                )
              }
            />
          </label>
          <label>
            Position Y
            <input
              type="number"
              value={command.position[1]}
              onChange={(event) =>
                updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
                  current.type === "transfer_player"
                    ? { ...current, position: [current.position[0], Number(event.target.value)] }
                    : current
                )
              }
            />
          </label>
        </div>
      );

    case "start_battle":
      return renderTextCommandField("Enemy", command.enemy, (value) =>
        updateEventCommand(onUpdateEvent, eventId, commandIndex, (current) =>
          current.type === "start_battle" ? { ...current, enemy: value } : current
        )
      );

    case "choice":
      return (
        <div className="event-inspector__command-readonly">
          <p>Prompt: {command.prompt}</p>
          <ul>
            {command.options.map((option, optionIndex) => (
              <li key={`${option.label}-${optionIndex}`}>
                {option.label} ({option.commands.length} nested commands)
              </li>
            ))}
          </ul>
          <p className="event-inspector__readonly-note">Nested command editing is not available in this phase.</p>
        </div>
      );

    case "if_flag":
      return (
        <div className="event-inspector__command-readonly">
          <p>
            Flag: {command.flag}. Then: {command.then.length} commands. Else: {command.else?.length ?? 0} commands.
          </p>
          <p className="event-inspector__readonly-note">Nested command editing is not available in this phase.</p>
        </div>
      );

    case "give_item":
    case "take_item":
      return (
        <p className="event-inspector__readonly-note">
          Item: {command.item}. Quantity: {command.quantity ?? 1}. Read-only in this phase.
        </p>
      );

    default:
      return <p className="event-inspector__readonly-note">{commandType} is read-only in this phase.</p>;
  }
}

function renderTextCommandField(label: string, value: string, onChange: (value: string) => void) {
  return (
    <div className="event-inspector__command-fields">
      <label>
        {label}
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    </div>
  );
}
