import type { GameProject, GridPosition } from "@rpg-deck/core-domain";
import { advanceCurrentMessage, chooseCurrentOption, executeEvent } from "./commands.js";
import { findFirstEventAtPosition, isBlocked, nextPosition } from "./input.js";
import type { Direction, GameRuntime, PlayerInput, RuntimeEventLogEntry, RuntimeState } from "./model.js";
import { snapshotFromState } from "./snapshot.js";

export function createRuntime(project: GameProject): GameRuntime {
  const state = createInitialState(project);

  return {
    startNewGame() {
      resetForNewGame(state);
    },
    dispatch(input: PlayerInput) {
      dispatchInput(state, input);
    },
    getSnapshot() {
      return snapshotFromState(state);
    },
    getEventLog() {
      return state.eventLog.map((entry) => ({
        ...entry,
        position: entry.position ? [...entry.position] : undefined
      }));
    }
  };
}

function createInitialState(project: GameProject): RuntimeState {
  return {
    project,
    currentMapId: project.settings.start.map,
    playerPosition: [...project.settings.start.position],
    facingDirection: "down",
    status: "idle",
    currentMessage: null,
    currentChoice: null,
    pendingChoice: null,
    pendingCommands: null,
    currentBattle: null,
    flags: Object.fromEntries(Object.keys(project.flags).map((flagId) => [flagId, false])),
    currentBgm: null,
    eventLog: [],
    nextLogSeq: 1
  };
}

function resetForNewGame(state: RuntimeState) {
  state.currentMapId = state.project.settings.start.map;
  state.playerPosition = [...state.project.settings.start.position];
  state.facingDirection = "down";
  state.status = "idle";
  state.currentMessage = null;
  state.currentChoice = null;
  state.pendingChoice = null;
  state.pendingCommands = null;
  state.currentBattle = null;
  state.flags = Object.fromEntries(Object.keys(state.project.flags).map((flagId) => [flagId, false]));
  state.currentBgm = null;
  state.eventLog = [];
  state.nextLogSeq = 1;
  appendRuntimeLog(state, {
    type: "new_game_started",
    mapId: state.currentMapId,
    position: state.playerPosition
  });
}

function dispatchInput(state: RuntimeState, input: PlayerInput) {
  if (input.type === "move") {
    movePlayer(state, input.direction);
    return;
  }

  if (input.type === "choose") {
    chooseCurrentOption(state, input.optionIndex);
    return;
  }

  if (input.type === "advance") {
    advanceCurrentMessage(state);
    return;
  }

  interact(state, input.direction ?? state.facingDirection);
}

function movePlayer(state: RuntimeState, direction: Direction) {
  state.facingDirection = direction;
  const currentMap = state.project.maps[state.currentMapId];
  const destination = nextPosition(state.playerPosition, direction);

  if (!currentMap || isBlocked(currentMap, destination)) {
    appendRuntimeLog(state, {
      type: "movement_blocked",
      mapId: state.currentMapId,
      position: destination,
      direction,
      reason: currentMap ? "blocked" : "missing_map"
    });
    return;
  }

  state.playerPosition = destination;
  state.status = "idle";
  state.currentMessage = null;
  state.currentChoice = null;
  state.pendingChoice = null;
  state.pendingCommands = null;
  state.currentBattle = null;
  appendRuntimeLog(state, {
    type: "player_moved",
    mapId: state.currentMapId,
    position: destination,
    direction
  });

  const touchEvent = findFirstEventAtPosition(state.project, state.currentMapId, destination, "touch");
  if (touchEvent) {
    executeEvent(state, touchEvent);
  }
}

function interact(state: RuntimeState, direction: Direction) {
  state.facingDirection = direction;
  const targetPosition = nextPosition(state.playerPosition, direction);
  const event = findFirstEventAtPosition(state.project, state.currentMapId, targetPosition, "interact");

  if (event) {
    executeEvent(state, event);
  }
}

function appendRuntimeLog(state: RuntimeState, entry: Omit<RuntimeEventLogEntry, "seq">) {
  state.eventLog.push({
    seq: state.nextLogSeq,
    ...entry,
    position: entry.position ? ([...entry.position] as GridPosition) : undefined
  });
  state.nextLogSeq += 1;
}
