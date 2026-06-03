# Project Format

The canonical project format belongs to `packages/core-domain`.

Runtime implementations, editor views, and Godot export code must consume this format rather than inventing their own source of truth.

## Core Model Scope

Core data should include:

* `GameProject`
* `MapDefinition`
* `EventDefinition`
* `BattleDefinition`
* `DialogueDefinition`
* `ActorDefinition`
* `EnemyDefinition`
* `ItemDefinition`
* `AssetManifest`
* `FlagDefinition`
* `SwitchDefinition`
* `VariableDefinition`
* `ValidationIssue`
* `ProjectDiff`

Core services should include:

* Zod schemas
* validation
* reference integrity checks
* diff generation
* event graph generation
* YAML and JSON serialization

## Storage Format

The project should support YAML and JSON serialization through `core-domain`.

Sample project shape:

```text
packages/sample-projects/
  tiny-rpg/
    game.yaml
    maps/
    events/
    actors/
    enemies/
```

`game.yaml` should describe the project manifest and reference domain files. The exact split can evolve, but references should remain explicit and validated.

## Asset References

Core data must use stable asset IDs, not runtime-specific paths.

Avoid:

```yaml
sprite: assets/sprites/mayor.png
```

Prefer:

```yaml
sprite: mayor
```

Resolve the ID through an asset manifest:

```yaml
assets:
  sprites:
    mayor:
      path: assets/sprites/characters/mayor.png
      frameSize: [16, 16]
```

This keeps Godot export free to convert paths to `res://...` or another runtime-specific scheme.

## Coordinates

The coordinate system should be fixed early.

Core convention:

```text
grid position = [x, y]
x = right
y = down
tileSize = project setting
```

Runtime conversion:

```text
worldX = gridX * tileSize
worldY = gridY * tileSize
```

Godot should use the same domain convention and convert at the runtime boundary.

## Runtime Objects

Runtime-specific objects must never be stored in core models.

Avoid:

```ts
type Npc = {
  sprite: PixiSprite;
  x: number;
  y: number;
  onClick: () => void;
};
```

Prefer:

```ts
type NpcEvent = {
  id: string;
  mapId: string;
  position: GridPosition;
  spriteId: string;
  trigger: EventTrigger;
  commands: EventCommand[];
};
```

Rendering should be resolved by the runtime from `spriteId`, not embedded in `core-domain`.

## Validation

Validation should catch:

* missing referenced maps
* missing referenced events
* missing referenced actors, enemies, items, or skills
* missing flags, switches, variables, and assets
* invalid coordinates
* invalid command payloads
* invalid nested command structures
* unreachable or cyclic event graph issues where relevant

Validation output should use structured `ValidationIssue` data so both CLI and editor UI can present the same errors.
