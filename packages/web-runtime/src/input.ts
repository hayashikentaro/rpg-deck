import type { EventDefinition, GameProject, GridPosition, MapDefinition } from "@rpg-deck/core-domain";
import type { Direction } from "./model.js";

export function nextPosition(position: GridPosition, direction: Direction): GridPosition {
  const [x, y] = position;
  if (direction === "up") return [x, y - 1];
  if (direction === "down") return [x, y + 1];
  if (direction === "left") return [x - 1, y];
  return [x + 1, y];
}

export function positionEquals(left: GridPosition, right: GridPosition) {
  return left[0] === right[0] && left[1] === right[1];
}

export function positionInBounds(position: GridPosition, map: MapDefinition) {
  const [x, y] = position;
  const [width, height] = map.size;
  return x >= 0 && y >= 0 && x < width && y < height;
}

export function isBlocked(map: MapDefinition, position: GridPosition) {
  if (!positionInBounds(position, map)) {
    return true;
  }
  return (map.collision ?? []).some((blockedPosition) => positionEquals(blockedPosition, position));
}

export function findEventsAtPosition(project: GameProject, mapId: string, position: GridPosition) {
  return Object.values(project.events).filter((event) => event.map === mapId && positionEquals(event.position, position));
}

export function findFirstEventAtPosition(
  project: GameProject,
  mapId: string,
  position: GridPosition,
  trigger: EventDefinition["trigger"]
) {
  return findEventsAtPosition(project, mapId, position).find((event) => event.trigger === trigger) ?? null;
}
