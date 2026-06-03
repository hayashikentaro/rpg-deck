export type GridPosition = [x: number, y: number];

export type EntityRecord<T extends { id: string }> = Record<string, T>;

export type ProjectSettings = {
  tileSize: number;
  start: {
    map: string;
    position: GridPosition;
  };
};

export type SpriteAsset = {
  path: string;
  frameSize?: GridPosition;
};

export type TilesetAsset = {
  path: string;
  tileSize: number;
};

export type AudioAsset = {
  path: string;
  kind?: "bgm" | "sfx";
};

export type AssetManifest = {
  sprites: Record<string, SpriteAsset>;
  tilesets: Record<string, TilesetAsset>;
  audio: Record<string, AudioAsset>;
};

export type TilesetDefinition = {
  id: string;
  name: string;
  asset: string;
  tileSize?: number;
};

export type MapDefinition = {
  id: string;
  name: string;
  size: GridPosition;
  tileset: string;
  events: string[];
  collision?: GridPosition[];
};

export type EventTrigger = "interact" | "autorun" | "touch";

export type ShowMessageCommand = {
  type: "show_message";
  speaker?: string;
  text: string;
};

export type ChoiceCommand = {
  type: "choice";
  prompt: string;
  options: Array<{
    label: string;
    commands: EventCommand[];
  }>;
};

export type SetFlagCommand = {
  type: "set_flag";
  flag: string;
};

export type UnsetFlagCommand = {
  type: "unset_flag";
  flag: string;
};

export type IfFlagCommand = {
  type: "if_flag";
  flag: string;
  then: EventCommand[];
  else?: EventCommand[];
};

export type GiveItemCommand = {
  type: "give_item";
  item: string;
  quantity?: number;
};

export type TakeItemCommand = {
  type: "take_item";
  item: string;
  quantity?: number;
};

export type StartBattleCommand = {
  type: "start_battle";
  enemy: string;
};

export type TransferPlayerCommand = {
  type: "transfer_player";
  map: string;
  position: GridPosition;
};

export type PlayBgmCommand = {
  type: "play_bgm";
  bgm: string;
};

export type PlaySfxCommand = {
  type: "play_sfx";
  sfx: string;
};

export type EventCommand =
  | ShowMessageCommand
  | ChoiceCommand
  | SetFlagCommand
  | UnsetFlagCommand
  | IfFlagCommand
  | GiveItemCommand
  | TakeItemCommand
  | StartBattleCommand
  | TransferPlayerCommand
  | PlayBgmCommand
  | PlaySfxCommand;

export type EventDefinition = {
  id: string;
  map: string;
  position: GridPosition;
  sprite?: string;
  trigger: EventTrigger;
  commands: EventCommand[];
};

export type ActorDefinition = {
  id: string;
  name: string;
};

export type EnemyDefinition = {
  id: string;
  name: string;
};

export type ItemDefinition = {
  id: string;
  name: string;
};

export type SkillDefinition = {
  id: string;
  name: string;
};

export type FlagDefinition = {
  id: string;
  name: string;
};

export type SwitchDefinition = {
  id: string;
  name: string;
  default?: boolean;
};

export type VariableDefinition = {
  id: string;
  name: string;
  default?: number | string | boolean;
};

export type GameProject = {
  id: string;
  title: string;
  settings: ProjectSettings;
  assets: AssetManifest;
  tilesets: EntityRecord<TilesetDefinition>;
  maps: EntityRecord<MapDefinition>;
  events: EntityRecord<EventDefinition>;
  actors: EntityRecord<ActorDefinition>;
  enemies: EntityRecord<EnemyDefinition>;
  items: EntityRecord<ItemDefinition>;
  skills: EntityRecord<SkillDefinition>;
  flags: EntityRecord<FlagDefinition>;
  switches: EntityRecord<SwitchDefinition>;
  variables: EntityRecord<VariableDefinition>;
};

export type SaveState = {
  projectId: string;
  currentMap: string;
  playerPosition: GridPosition;
  party: string[];
  inventory: Record<string, number>;
  flags: Record<string, boolean>;
  switches: Record<string, boolean>;
  variables: Record<string, number | string | boolean>;
};

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  path: string;
  entityId?: string;
  entityType?: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  startMap: string;
  startPosition: GridPosition;
  counts: {
    maps: number;
    events: number;
    actors: number;
    enemies: number;
    items: number;
    skills: number;
    flags: number;
    switches: number;
    variables: number;
  };
};

export type ProjectEntityType =
  | "project"
  | "asset"
  | "tileset"
  | "map"
  | "event"
  | "actor"
  | "enemy"
  | "item"
  | "skill"
  | "flag"
  | "switch"
  | "variable";

export type ProjectDiffChange = {
  type: "added" | "removed" | "changed";
  entityType: ProjectEntityType;
  entityId: string;
  path: string;
  before?: unknown;
  after?: unknown;
};

export type ProjectDiff = {
  beforeProjectId: string;
  afterProjectId: string;
  changes: ProjectDiffChange[];
};

export type EventGraphNode = {
  id: string;
  type: "event" | "map" | "battle" | "choice" | "flag";
  label: string;
};

export type EventGraphEdge = {
  from: string;
  to: string;
  type: "contains" | "transfer" | "battle" | "choice" | "flag_set" | "flag_unset" | "flag_condition";
  label?: string;
};

export type EventGraph = {
  nodes: EventGraphNode[];
  edges: EventGraphEdge[];
};
