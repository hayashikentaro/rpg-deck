import type { EventCommand, EventDefinition, GridPosition } from "@rpg-deck/core-domain";
import type { RuntimeEventLogEntry, RuntimeState } from "./model.js";

export function executeEvent(state: RuntimeState, event: EventDefinition) {
  appendLog(state, {
    type: "event_triggered",
    eventId: event.id,
    mapId: event.map,
    position: event.position
  });
  executeCommands(state, event.commands, event.id);
}

export function executeCommands(state: RuntimeState, commands: EventCommand[], eventId?: string) {
  state.pendingCommands = {
    eventId,
    commands: [...commands],
    nextIndex: 0
  };
  runPendingCommands(state);
}

export function advanceCurrentMessage(state: RuntimeState) {
  if (!state.currentMessage) {
    appendLog(state, {
      type: "advance_ignored",
      reason: "no_current_message"
    });
    return;
  }

  state.currentMessage = null;
  state.status = "idle";
  appendLog(state, {
    type: "advanced",
    eventId: state.pendingCommands?.eventId
  });
  runPendingCommands(state);
}

export function chooseCurrentOption(state: RuntimeState, optionIndex: number) {
  const pendingChoice = state.pendingChoice;
  const option = pendingChoice?.options[optionIndex];

  if (!pendingChoice || !option) {
    appendLog(state, {
      type: "choice_ignored",
      optionIndex,
      reason: pendingChoice ? "invalid_option_index" : "no_current_choice"
    });
    return;
  }

  state.currentChoice = null;
  state.pendingChoice = null;
  state.status = "idle";
  appendLog(state, {
    type: "choice_selected",
    eventId: pendingChoice.eventId,
    optionIndex,
    message: option.label
  });

  if (state.pendingCommands) {
    state.pendingCommands.commands.splice(state.pendingCommands.nextIndex, 0, ...option.commands);
    runPendingCommands(state);
    return;
  }

  executeCommands(state, option.commands, pendingChoice.eventId);
}

function runPendingCommands(state: RuntimeState) {
  const sequence = state.pendingCommands;
  if (!sequence) return;

  while (sequence.nextIndex < sequence.commands.length) {
    const command = sequence.commands[sequence.nextIndex];
    sequence.nextIndex += 1;

    if (executeCommand(state, command, sequence)) return;
  }

  state.pendingCommands = null;
}

function executeCommand(
  state: RuntimeState,
  command: EventCommand,
  sequence: NonNullable<RuntimeState["pendingCommands"]>
): boolean {
  const eventId = sequence.eventId;

  switch (command.type) {
    case "show_message":
      state.status = "message";
      state.currentMessage = {
        speaker: command.speaker,
        text: command.text
      };
      state.currentChoice = null;
      state.pendingChoice = null;
      state.currentBattle = null;
      appendLog(state, {
        type: "message",
        eventId,
        commandType: command.type,
        message: command.text
      });
      return true;

    case "set_flag":
      state.flags[command.flag] = true;
      appendLog(state, {
        type: "flag_changed",
        eventId,
        commandType: command.type,
        flag: command.flag,
        value: true
      });
      return false;

    case "unset_flag":
      state.flags[command.flag] = false;
      appendLog(state, {
        type: "flag_changed",
        eventId,
        commandType: command.type,
        flag: command.flag,
        value: false
      });
      return false;

    case "play_bgm":
      state.currentBgm = command.bgm;
      appendLog(state, {
        type: "bgm_changed",
        eventId,
        commandType: command.type,
        assetId: command.bgm
      });
      return false;

    case "play_sfx":
      appendLog(state, {
        type: "sfx_played",
        eventId,
        commandType: command.type,
        assetId: command.sfx
      });
      return false;

    case "transfer_player":
      state.status = "transferring";
      state.currentMapId = command.map;
      state.playerPosition = [...command.position];
      state.currentMessage = null;
      state.currentChoice = null;
      state.pendingChoice = null;
      state.currentBattle = null;
      appendLog(state, {
        type: "player_transferred",
        eventId,
        commandType: command.type,
        mapId: command.map,
        position: command.position
      });
      return false;

    case "start_battle":
      state.status = "battle";
      state.currentBattle = {
        enemyId: command.enemy
      };
      state.currentMessage = null;
      state.currentChoice = null;
      state.pendingChoice = null;
      appendLog(state, {
        type: "battle_started",
        eventId,
        commandType: command.type,
        enemyId: command.enemy
      });
      return false;

    case "choice":
      state.status = "choice";
      state.currentChoice = {
        prompt: command.prompt,
        options: command.options.map((option, index) => ({
          index,
          label: option.label
        }))
      };
      state.pendingChoice = {
        eventId,
        options: command.options
      };
      state.currentMessage = null;
      state.currentBattle = null;
      appendLog(state, {
        type: "choice",
        eventId,
        commandType: command.type,
        message: command.prompt
      });
      return true;

    case "if_flag":
      sequence.commands.splice(sequence.nextIndex, 0, ...(state.flags[command.flag] ? command.then : command.else ?? []));
      return false;

    case "give_item":
    case "take_item":
      return false;
  }
}

function appendLog(state: RuntimeState, entry: Omit<RuntimeEventLogEntry, "seq">) {
  state.eventLog.push({
    seq: state.nextLogSeq,
    ...cloneLogEntry(entry)
  });
  state.nextLogSeq += 1;
}

function cloneLogEntry(entry: Omit<RuntimeEventLogEntry, "seq">) {
  return {
    ...entry,
    position: entry.position ? ([...entry.position] as GridPosition) : undefined
  };
}
