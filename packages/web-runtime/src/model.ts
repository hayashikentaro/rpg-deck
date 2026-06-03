import type { GameProject, GridPosition } from "@rpg-deck/core-domain";

export type Direction = "up" | "down" | "left" | "right";

export type PlayerInput = { type: "move"; direction: Direction } | { type: "interact"; direction?: Direction };

export type RuntimeStatus = "idle" | "message" | "choice" | "battle" | "transferring";

export type RuntimeMessage = {
  speaker?: string;
  text: string;
};

export type RuntimeChoice = {
  prompt: string;
  options: Array<{
    index: number;
    label: string;
  }>;
};

export type RuntimeBattle = {
  enemyId: string;
};

export type RuntimeEventLogEntry = {
  seq: number;
  type:
    | "new_game_started"
    | "movement_blocked"
    | "player_moved"
    | "event_triggered"
    | "message"
    | "choice"
    | "flag_changed"
    | "bgm_changed"
    | "sfx_played"
    | "player_transferred"
    | "battle_started";
  eventId?: string;
  commandType?: string;
  message?: string;
  mapId?: string;
  position?: GridPosition;
  direction?: Direction;
  flag?: string;
  value?: boolean;
  assetId?: string;
  enemyId?: string;
  reason?: string;
};

export type RuntimeState = {
  project: GameProject;
  currentMapId: string;
  playerPosition: GridPosition;
  facingDirection: Direction;
  status: RuntimeStatus;
  currentMessage: RuntimeMessage | null;
  currentChoice: RuntimeChoice | null;
  currentBattle: RuntimeBattle | null;
  flags: Record<string, boolean>;
  currentBgm: string | null;
  eventLog: RuntimeEventLogEntry[];
  nextLogSeq: number;
};

export type RuntimeSnapshot = {
  projectId: string;
  currentMapId: string;
  playerPosition: GridPosition;
  facingDirection: Direction;
  status: RuntimeStatus;
  currentMessage: RuntimeMessage | null;
  currentChoice: RuntimeChoice | null;
  currentBattle: RuntimeBattle | null;
  flags: Record<string, boolean>;
  currentBgm: string | null;
};

export type GameRuntime = {
  startNewGame(): void;
  dispatch(input: PlayerInput): void;
  getSnapshot(): RuntimeSnapshot;
  getEventLog(): RuntimeEventLogEntry[];
};
