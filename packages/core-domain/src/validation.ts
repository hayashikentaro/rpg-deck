import { ZodError } from "zod";
import type { EventCommand, GameProject, GridPosition, MapDefinition, ValidationIssue } from "./model.js";
import { gameProjectSchema } from "./schema.js";

type CommandContext = {
  eventId: string;
  path: string;
};

export function validateProject(project: GameProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parsed = gameProjectSchema.safeParse(project);

  if (!parsed.success) {
    issues.push(...issuesFromZodError(parsed.error));
    return issues;
  }

  const validProject = parsed.data as GameProject;

  validateRecordKeys(validProject, issues);
  validateStart(validProject, issues);
  validateTilesets(validProject, issues);
  validateMaps(validProject, issues);
  validateEvents(validProject, issues);

  return issues;
}

function issuesFromZodError(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    severity: "error",
    code: "invalid_schema",
    message: issue.message,
    path: formatPath(issue.path)
  }));
}

function validateRecordKeys(project: GameProject, issues: ValidationIssue[]) {
  validateIdMatchesKey("tilesets", project.tilesets, "tileset", issues);
  validateIdMatchesKey("maps", project.maps, "map", issues);
  validateIdMatchesKey("events", project.events, "event", issues);
  validateIdMatchesKey("actors", project.actors, "actor", issues);
  validateIdMatchesKey("enemies", project.enemies, "enemy", issues);
  validateIdMatchesKey("items", project.items, "item", issues);
  validateIdMatchesKey("skills", project.skills, "skill", issues);
  validateIdMatchesKey("flags", project.flags, "flag", issues);
  validateIdMatchesKey("switches", project.switches, "switch", issues);
  validateIdMatchesKey("variables", project.variables, "variable", issues);
}

function validateIdMatchesKey(
  pathPrefix: string,
  record: Record<string, { id: string }>,
  entityType: string,
  issues: ValidationIssue[]
) {
  for (const [key, value] of Object.entries(record)) {
    if (value.id !== key) {
      issues.push({
        severity: "error",
        code: "id_key_mismatch",
        message: `${entityType} '${value.id}' is stored under key '${key}'.`,
        path: `${pathPrefix}.${key}.id`,
        entityId: value.id,
        entityType
      });
    }
  }
}

function validateStart(project: GameProject, issues: ValidationIssue[]) {
  const startMap = project.maps[project.settings.start.map];

  if (!startMap) {
    issues.push({
      severity: "error",
      code: "missing_start_map",
      message: `Start map '${project.settings.start.map}' does not exist.`,
      path: "settings.start.map",
      entityId: project.settings.start.map,
      entityType: "map"
    });
    return;
  }

  if (!isPositionInsideMap(project.settings.start.position, startMap)) {
    issues.push({
      severity: "error",
      code: "invalid_start_position",
      message: `Start position ${formatPosition(project.settings.start.position)} is outside map '${startMap.id}'.`,
      path: "settings.start.position",
      entityId: startMap.id,
      entityType: "map"
    });
  }
}

function validateTilesets(project: GameProject, issues: ValidationIssue[]) {
  for (const tileset of Object.values(project.tilesets)) {
    if (!project.assets.tilesets[tileset.asset]) {
      issues.push({
        severity: "error",
        code: "missing_tileset_asset",
        message: `Tileset '${tileset.id}' references missing tileset asset '${tileset.asset}'.`,
        path: `tilesets.${tileset.id}.asset`,
        entityId: tileset.id,
        entityType: "tileset"
      });
    }
  }
}

function validateMaps(project: GameProject, issues: ValidationIssue[]) {
  for (const map of Object.values(project.maps)) {
    if (!project.tilesets[map.tileset]) {
      issues.push({
        severity: "error",
        code: "missing_tileset",
        message: `Map '${map.id}' references missing tileset '${map.tileset}'.`,
        path: `maps.${map.id}.tileset`,
        entityId: map.id,
        entityType: "map"
      });
    }

    for (const eventId of map.events) {
      if (!project.events[eventId]) {
        issues.push({
          severity: "error",
          code: "missing_map_event",
          message: `Map '${map.id}' references missing event '${eventId}'.`,
          path: `maps.${map.id}.events`,
          entityId: map.id,
          entityType: "map"
        });
      }
    }

    for (const [index, position] of map.collision?.entries() ?? []) {
      if (!isPositionInsideMap(position, map)) {
        issues.push({
          severity: "error",
          code: "invalid_collision_position",
          message: `Collision position ${formatPosition(position)} is outside map '${map.id}'.`,
          path: `maps.${map.id}.collision.${index}`,
          entityId: map.id,
          entityType: "map"
        });
      }
    }
  }
}

function validateEvents(project: GameProject, issues: ValidationIssue[]) {
  for (const event of Object.values(project.events)) {
    const map = project.maps[event.map];

    if (!map) {
      issues.push({
        severity: "error",
        code: "missing_event_map",
        message: `Event '${event.id}' references missing map '${event.map}'.`,
        path: `events.${event.id}.map`,
        entityId: event.id,
        entityType: "event"
      });
    } else if (!isPositionInsideMap(event.position, map)) {
      issues.push({
        severity: "error",
        code: "event_outside_map",
        message: `Event '${event.id}' position ${formatPosition(event.position)} is outside map '${map.id}'.`,
        path: `events.${event.id}.position`,
        entityId: event.id,
        entityType: "event"
      });
    }

    if (event.sprite && !project.assets.sprites[event.sprite]) {
      issues.push({
        severity: "error",
        code: "missing_sprite_asset",
        message: `Event '${event.id}' references missing sprite asset '${event.sprite}'.`,
        path: `events.${event.id}.sprite`,
        entityId: event.id,
        entityType: "event"
      });
    }

    validateCommands(project, event.commands, issues, {
      eventId: event.id,
      path: `events.${event.id}.commands`
    });
  }
}

function validateCommands(
  project: GameProject,
  commands: EventCommand[],
  issues: ValidationIssue[],
  context: CommandContext
) {
  commands.forEach((command, index) => {
    const path = `${context.path}.${index}`;

    switch (command.type) {
      case "show_message":
        return;

      case "choice":
        command.options.forEach((option, optionIndex) => {
          validateCommands(project, option.commands, issues, {
            eventId: context.eventId,
            path: `${path}.options.${optionIndex}.commands`
          });
        });
        return;

      case "set_flag":
      case "unset_flag":
        validateFlagReference(project, command.flag, issues, path, context.eventId, command.type);
        return;

      case "if_flag":
        validateFlagReference(project, command.flag, issues, path, context.eventId, "if_flag");
        validateCommands(project, command.then, issues, {
          eventId: context.eventId,
          path: `${path}.then`
        });
        validateCommands(project, command.else ?? [], issues, {
          eventId: context.eventId,
          path: `${path}.else`
        });
        return;

      case "give_item":
      case "take_item":
        if (!project.items[command.item]) {
          issues.push({
            severity: "error",
            code: "missing_item",
            message: `Command '${command.type}' references missing item '${command.item}'.`,
            path: `${path}.item`,
            entityId: context.eventId,
            entityType: "event"
          });
        }
        return;

      case "start_battle":
        if (!project.enemies[command.enemy]) {
          issues.push({
            severity: "error",
            code: "missing_enemy",
            message: `Command 'start_battle' references missing enemy '${command.enemy}'.`,
            path: `${path}.enemy`,
            entityId: context.eventId,
            entityType: "event"
          });
        }
        return;

      case "transfer_player":
        validateTransfer(project, command.map, command.position, issues, path, context.eventId);
        return;

      case "play_bgm":
        validateAudioReference(project, command.bgm, "bgm", issues, path, context.eventId);
        return;

      case "play_sfx":
        validateAudioReference(project, command.sfx, "sfx", issues, path, context.eventId);
        return;
    }
  });
}

function validateFlagReference(
  project: GameProject,
  flag: string,
  issues: ValidationIssue[],
  path: string,
  eventId: string,
  commandType: string
) {
  if (!project.flags[flag]) {
    issues.push({
      severity: "error",
      code: "missing_flag",
      message: `Command '${commandType}' references missing flag '${flag}'.`,
      path: `${path}.flag`,
      entityId: eventId,
      entityType: "event"
    });
  }
}

function validateTransfer(
  project: GameProject,
  mapId: string,
  position: GridPosition,
  issues: ValidationIssue[],
  path: string,
  eventId: string
) {
  const targetMap = project.maps[mapId];

  if (!targetMap) {
    issues.push({
      severity: "error",
      code: "missing_transfer_map",
      message: `Command 'transfer_player' references missing map '${mapId}'.`,
      path: `${path}.map`,
      entityId: eventId,
      entityType: "event"
    });
    return;
  }

  if (!isPositionInsideMap(position, targetMap)) {
    issues.push({
      severity: "error",
      code: "invalid_transfer_position",
      message: `Transfer position ${formatPosition(position)} is outside map '${mapId}'.`,
      path: `${path}.position`,
      entityId: eventId,
      entityType: "event"
    });
  }
}

function validateAudioReference(
  project: GameProject,
  audioId: string,
  expectedKind: "bgm" | "sfx",
  issues: ValidationIssue[],
  path: string,
  eventId: string
) {
  const audio = project.assets.audio[audioId];

  if (!audio) {
    issues.push({
      severity: "error",
      code: "missing_audio_asset",
      message: `Command 'play_${expectedKind}' references missing audio asset '${audioId}'.`,
      path: `${path}.${expectedKind}`,
      entityId: eventId,
      entityType: "event"
    });
    return;
  }

  if (audio.kind && audio.kind !== expectedKind) {
    issues.push({
      severity: "error",
      code: "audio_kind_mismatch",
      message: `Command 'play_${expectedKind}' references audio asset '${audioId}' with kind '${audio.kind}'.`,
      path: `${path}.${expectedKind}`,
      entityId: eventId,
      entityType: "event"
    });
  }
}

function isPositionInsideMap(position: GridPosition, map: MapDefinition) {
  const [x, y] = position;
  const [width, height] = map.size;
  return x >= 0 && y >= 0 && x < width && y < height;
}

function formatPosition(position: GridPosition) {
  return `[${position[0]}, ${position[1]}]`;
}

function formatPath(path: Array<string | number>) {
  return path.length > 0 ? path.join(".") : ".";
}
