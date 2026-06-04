import type { CSSProperties } from "react";
import type { EventDefinition, GameProject, GridPosition } from "@rpg-deck/core-domain";
import type { RuntimeEventLogEntry, RuntimeSnapshot } from "@rpg-deck/web-runtime";

export type PlayablePreviewProps = {
  project: GameProject;
  snapshot: RuntimeSnapshot;
  eventLog?: RuntimeEventLogEntry[];
  className?: string;
};

type CellView = {
  position: GridPosition;
  marker: "↑" | "↓" | "←" | "→" | "#" | "N" | "T" | "A" | ".";
  kind: "player" | "collision" | "interact" | "touch" | "autorun" | "empty";
  label: string;
};

export function PlayablePreview({ project, snapshot, eventLog = [], className }: PlayablePreviewProps) {
  const currentMap = project.maps[snapshot.currentMapId];

  if (!currentMap) {
    return (
      <section className={["playable-preview", className].filter(Boolean).join(" ")} aria-label="Playable preview">
        <h2>Playable Grid Preview</h2>
        <p>Current map is missing: {snapshot.currentMapId}</p>
      </section>
    );
  }

  const [width, height] = currentMap.size;
  const cells = buildCells(project, snapshot);

  return (
    <section className={["playable-preview", className].filter(Boolean).join(" ")} aria-label="Playable preview">
      <div className="playable-preview__header">
        <h2>Playable Grid Preview</h2>
        <p>
          {currentMap.name} ({currentMap.id})
        </p>
      </div>
      <div className="playable-preview__body">
        <div
          aria-label={`Current map grid ${currentMap.id}`}
          className="playable-preview__grid"
          role="grid"
          style={{ "--grid-columns": width } as CSSProperties}
        >
          {cells.map((cell) => (
            <div
              aria-label={cell.label}
              className="playable-preview__cell"
              data-cell-kind={cell.kind}
              key={`${cell.position[0]}-${cell.position[1]}`}
              role="gridcell"
            >
              {cell.marker}
            </div>
          ))}
        </div>
        <aside className="playable-preview__status" aria-label="Runtime status panel">
          <h3>Runtime Status</h3>
          <dl>
            <dt>Map</dt>
            <dd>{snapshot.currentMapId}</dd>
            <dt>Position</dt>
            <dd>[{snapshot.playerPosition.join(", ")}]</dd>
            <dt>Facing</dt>
            <dd>{snapshot.facingDirection}</dd>
            <dt>Status</dt>
            <dd>{snapshot.status}</dd>
            <dt>BGM</dt>
            <dd>{snapshot.currentBgm ?? "none"}</dd>
          </dl>
          {snapshot.currentMessage ? (
            <section className="playable-preview__message" aria-label="Current message">
              <h4>Message</h4>
              {snapshot.currentMessage.speaker ? <strong>{snapshot.currentMessage.speaker}</strong> : null}
              <p>{snapshot.currentMessage.text}</p>
            </section>
          ) : null}
          {snapshot.currentChoice ? (
            <section className="playable-preview__choice" aria-label="Current choice">
              <h4>Choice</h4>
              <p>{snapshot.currentChoice.prompt}</p>
              <ol>
                {snapshot.currentChoice.options.map((option) => (
                  <li key={option.index}>{option.label}</li>
                ))}
              </ol>
            </section>
          ) : null}
          {snapshot.currentBattle ? (
            <section className="playable-preview__battle" aria-label="Battle placeholder">
              <h4>Battle Placeholder</h4>
              <p>Enemy: {snapshot.currentBattle.enemyId}</p>
            </section>
          ) : null}
          {eventLog.length > 0 ? (
            <section className="playable-preview__last-log" aria-label="Latest runtime log">
              <h4>Latest Log</h4>
              <p>{eventLog[0]?.type}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function buildCells(project: GameProject, snapshot: RuntimeSnapshot): CellView[] {
  const currentMap = project.maps[snapshot.currentMapId];
  if (!currentMap) return [];

  const [width, height] = currentMap.size;
  const cells: CellView[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const position: GridPosition = [x, y];
      cells.push(cellForPosition(project, snapshot, position));
    }
  }

  return cells;
}

function cellForPosition(project: GameProject, snapshot: RuntimeSnapshot, position: GridPosition): CellView {
  if (positionsEqual(position, snapshot.playerPosition)) {
    return {
      position,
      marker: playerMarker(snapshot.facingDirection),
      kind: "player",
      label: `Player at ${positionLabel(position)}, facing ${snapshot.facingDirection}`
    };
  }

  const event = eventAtPosition(project, snapshot.currentMapId, position);
  if (event) {
    const marker = event.trigger === "interact" ? "N" : event.trigger === "touch" ? "T" : "A";
    return {
      position,
      marker,
      kind: event.trigger,
      label: `${event.trigger} event ${event.id} at ${positionLabel(position)}`
    };
  }

  const currentMap = project.maps[snapshot.currentMapId];
  const blocked = (currentMap?.collision ?? []).some((blockedPosition) => positionsEqual(blockedPosition, position));
  if (blocked) {
    return {
      position,
      marker: "#",
      kind: "collision",
      label: `Collision at ${positionLabel(position)}`
    };
  }

  return {
    position,
    marker: ".",
    kind: "empty",
    label: `Empty floor at ${positionLabel(position)}`
  };
}

function eventAtPosition(project: GameProject, mapId: string, position: GridPosition): EventDefinition | null {
  return Object.values(project.events).find((event) => event.map === mapId && positionsEqual(event.position, position)) ?? null;
}

function positionsEqual(left: GridPosition, right: GridPosition) {
  return left[0] === right[0] && left[1] === right[1];
}

function positionLabel(position: GridPosition) {
  return `[${position.join(", ")}]`;
}

function playerMarker(direction: RuntimeSnapshot["facingDirection"]) {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  if (direction === "left") return "←";
  return "→";
}
