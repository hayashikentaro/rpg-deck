import { z } from "zod";

const idSchema = z.string().min(1);

export const gridPositionSchema = z
  .tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])
  .describe("Grid position [x, y], where x is right and y is down.");

const mapSizeSchema = z
  .tuple([z.number().int().positive(), z.number().int().positive()])
  .describe("Map size [width, height].");

const spriteAssetSchema = z.object({
  path: z.string().min(1),
  frameSize: gridPositionSchema.optional()
});

const tilesetAssetSchema = z.object({
  path: z.string().min(1),
  tileSize: z.number().int().positive()
});

const audioAssetSchema = z.object({
  path: z.string().min(1),
  kind: z.enum(["bgm", "sfx"]).optional()
});

export const assetManifestSchema = z.object({
  sprites: z.record(spriteAssetSchema).default({}),
  tilesets: z.record(tilesetAssetSchema).default({}),
  audio: z.record(audioAssetSchema).default({})
});

export const tilesetDefinitionSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  asset: idSchema,
  tileSize: z.number().int().positive().optional()
});

export const mapDefinitionSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  size: mapSizeSchema,
  tileset: idSchema,
  events: z.array(idSchema).default([]),
  collision: z.array(gridPositionSchema).optional()
});

export const eventTriggerSchema = z.enum(["interact", "autorun", "touch"]);

export type EventCommandInput = z.input<typeof eventCommandSchema>;

const baseCommandSchema = z.object({
  type: z.string().min(1)
});

type CommandSchema = z.ZodTypeAny;

export const eventCommandSchema: CommandSchema = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("show_message"),
      speaker: idSchema.optional(),
      text: z.string().min(1)
    }),
    z.object({
      type: z.literal("choice"),
      prompt: z.string().min(1),
      options: z.array(
        z.object({
          label: z.string().min(1),
          commands: z.array(eventCommandSchema)
        })
      ).min(1)
    }),
    z.object({
      type: z.literal("set_flag"),
      flag: idSchema
    }),
    z.object({
      type: z.literal("unset_flag"),
      flag: idSchema
    }),
    z.object({
      type: z.literal("if_flag"),
      flag: idSchema,
      then: z.array(eventCommandSchema),
      else: z.array(eventCommandSchema).optional()
    }),
    z.object({
      type: z.literal("give_item"),
      item: idSchema,
      quantity: z.number().int().positive().optional()
    }),
    z.object({
      type: z.literal("take_item"),
      item: idSchema,
      quantity: z.number().int().positive().optional()
    }),
    z.object({
      type: z.literal("start_battle"),
      enemy: idSchema
    }),
    z.object({
      type: z.literal("transfer_player"),
      map: idSchema,
      position: gridPositionSchema
    }),
    z.object({
      type: z.literal("play_bgm"),
      bgm: idSchema
    }),
    z.object({
      type: z.literal("play_sfx"),
      sfx: idSchema
    })
  ])
);

export const eventDefinitionSchema = z.object({
  id: idSchema,
  map: idSchema,
  position: gridPositionSchema,
  sprite: idSchema.optional(),
  trigger: eventTriggerSchema,
  commands: z.array(eventCommandSchema)
});

const namedDefinitionSchema = z.object({
  id: idSchema,
  name: z.string().min(1)
});

export const flagDefinitionSchema = namedDefinitionSchema;

export const switchDefinitionSchema = namedDefinitionSchema.extend({
  default: z.boolean().optional()
});

export const variableDefinitionSchema = namedDefinitionSchema.extend({
  default: z.union([z.number(), z.string(), z.boolean()]).optional()
});

export const gameProjectSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  settings: z.object({
    tileSize: z.number().int().positive(),
    start: z.object({
      map: idSchema,
      position: gridPositionSchema
    })
  }),
  assets: assetManifestSchema.default({ sprites: {}, tilesets: {}, audio: {} }),
  tilesets: z.record(tilesetDefinitionSchema).default({}),
  maps: z.record(mapDefinitionSchema).default({}),
  events: z.record(eventDefinitionSchema).default({}),
  actors: z.record(namedDefinitionSchema).default({}),
  enemies: z.record(namedDefinitionSchema).default({}),
  items: z.record(namedDefinitionSchema).default({}),
  skills: z.record(namedDefinitionSchema).default({}),
  flags: z.record(flagDefinitionSchema).default({}),
  switches: z.record(switchDefinitionSchema).default({}),
  variables: z.record(variableDefinitionSchema).default({})
});

export const saveStateSchema = z.object({
  projectId: idSchema,
  currentMap: idSchema,
  playerPosition: gridPositionSchema,
  party: z.array(idSchema).default([]),
  inventory: z.record(z.number().int().nonnegative()).default({}),
  flags: z.record(z.boolean()).default({}),
  switches: z.record(z.boolean()).default({}),
  variables: z.record(z.union([z.number(), z.string(), z.boolean()])).default({})
});

export function parseCommandPayload(input: unknown) {
  return baseCommandSchema.and(eventCommandSchema).parse(input);
}
