import type { RuntimeSnapshot, RuntimeState } from "./model.js";

export function snapshotFromState(state: RuntimeState): RuntimeSnapshot {
  return {
    projectId: state.project.id,
    currentMapId: state.currentMapId,
    playerPosition: [...state.playerPosition],
    facingDirection: state.facingDirection,
    status: state.status,
    currentMessage: state.currentMessage ? { ...state.currentMessage } : null,
    currentChoice: state.currentChoice
      ? {
          prompt: state.currentChoice.prompt,
          options: state.currentChoice.options.map((option) => ({ ...option }))
        }
      : null,
    canAdvance: state.currentMessage !== null,
    currentBattle: state.currentBattle ? { ...state.currentBattle } : null,
    flags: { ...state.flags },
    currentBgm: state.currentBgm
  };
}
