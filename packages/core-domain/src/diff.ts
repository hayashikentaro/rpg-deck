import type { EntityRecord, GameProject, ProjectDiff, ProjectDiffChange, ProjectEntityType } from "./model.js";

type DiffRecordSpec<T extends { id: string }> = {
  entityType: ProjectEntityType;
  path: string;
  before: EntityRecord<T>;
  after: EntityRecord<T>;
};

export function diffProjects(before: GameProject, after: GameProject): ProjectDiff {
  const changes: ProjectDiffChange[] = [];

  addCoarseProjectChange(changes, "title", before.title, after.title);
  addCoarseProjectChange(changes, "settings", before.settings, after.settings);
  diffAssetRecords(changes, "sprites", before.assets.sprites, after.assets.sprites);
  diffAssetRecords(changes, "tilesets", before.assets.tilesets, after.assets.tilesets);
  diffAssetRecords(changes, "audio", before.assets.audio, after.assets.audio);

  const specs: Array<DiffRecordSpec<{ id: string }>> = [
    { entityType: "tileset", path: "tilesets", before: before.tilesets, after: after.tilesets },
    { entityType: "map", path: "maps", before: before.maps, after: after.maps },
    { entityType: "event", path: "events", before: before.events, after: after.events },
    { entityType: "actor", path: "actors", before: before.actors, after: after.actors },
    { entityType: "enemy", path: "enemies", before: before.enemies, after: after.enemies },
    { entityType: "item", path: "items", before: before.items, after: after.items },
    { entityType: "skill", path: "skills", before: before.skills, after: after.skills },
    { entityType: "flag", path: "flags", before: before.flags, after: after.flags },
    { entityType: "switch", path: "switches", before: before.switches, after: after.switches },
    { entityType: "variable", path: "variables", before: before.variables, after: after.variables }
  ];

  for (const spec of specs) {
    diffRecord(changes, spec);
  }

  return {
    beforeProjectId: before.id,
    afterProjectId: after.id,
    changes
  };
}

function addCoarseProjectChange(changes: ProjectDiffChange[], path: "title" | "settings", before: unknown, after: unknown) {
  if (!isEqual(before, after)) {
    changes.push({
      type: "changed",
      entityType: "project",
      entityId: "project",
      path,
      before,
      after
    });
  }
}

function diffAssetRecords(
  changes: ProjectDiffChange[],
  category: "sprites" | "tilesets" | "audio",
  before: Record<string, unknown>,
  after: Record<string, unknown>
) {
  diffRecord(changes, {
    entityType: "asset",
    path: `assets.${category}`,
    before: withSyntheticIds(before),
    after: withSyntheticIds(after)
  });
}

function diffRecord<T extends { id: string }>(changes: ProjectDiffChange[], spec: DiffRecordSpec<T>) {
  const ids = new Set([...Object.keys(spec.before), ...Object.keys(spec.after)]);

  for (const id of [...ids].sort()) {
    const beforeValue = spec.before[id];
    const afterValue = spec.after[id];
    const path = `${spec.path}.${id}`;

    if (!beforeValue && afterValue) {
      changes.push({
        type: "added",
        entityType: spec.entityType,
        entityId: id,
        path,
        after: afterValue
      });
      continue;
    }

    if (beforeValue && !afterValue) {
      changes.push({
        type: "removed",
        entityType: spec.entityType,
        entityId: id,
        path,
        before: beforeValue
      });
      continue;
    }

    if (!isEqual(beforeValue, afterValue)) {
      changes.push({
        type: "changed",
        entityType: spec.entityType,
        entityId: id,
        path,
        before: beforeValue,
        after: afterValue
      });
    }
  }
}

function withSyntheticIds(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).map(([id, value]) => [id, { id, ...(isObject(value) ? value : { value }) }]));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}
