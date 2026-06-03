# Project Format

RPG Deck projects are declarative game projects. The external storage format is expected to be YAML or JSON. The internal representation should be TypeScript typed objects owned by `packages/core-domain`.

The project format should be readable by humans, AI agents, validators, runtime previews, exporters, and future tooling.

## Core Concepts

Initial domain concepts:

* `GameProject`
* `MapDefinition`
* `TilesetDefinition`
* `AssetManifest`
* `EventDefinition`
* `EventCommand`
* `ActorDefinition`
* `EnemyDefinition`
* `ItemDefinition`
* `SkillDefinition`
* `FlagDefinition`
* `SwitchDefinition`
* `VariableDefinition`
* `SaveState`

## Ownership

`packages/core-domain` owns:

* TypeScript domain types
* schemas
* validation
* reference integrity checks
* YAML and JSON loading
* YAML and JSON writing
* project summaries
* project diffs
* event graph data

Runtimes and editor screens consume this model. They do not redefine it.

## Storage Rules

* External storage is YAML or JSON.
* Internal representation is TypeScript typed objects.
* Validation lives in `core-domain`.
* Runtime-specific objects must not appear in saved project data.
* Editor-specific panel state must not appear in saved project data.
* Asset references use stable asset IDs, not runtime-specific paths.
* Coordinates are grid-based.
* Grid position is `[x, y]`.
* `x` is right.
* `y` is down.
* Tile size is a project setting.

## Asset References

Avoid storing direct runtime paths on entities:

    sprite: assets/sprites/characters/mayor.png

Prefer stable asset IDs:

    sprite: mayor

The asset manifest resolves the ID:

    assets:
      sprites:
        mayor:
          path: assets/sprites/characters/mayor.png
          frameSize: [16, 16]

The web runtime may resolve this to a browser asset URL. The Godot exporter or Godot adapter may resolve it to a `res://` path.

## Coordinate Rules

Core data uses grid coordinates:

    position: [12, 8]

The runtime converts to world coordinates:

    worldX = gridX * tileSize
    worldY = gridY * tileSize

This rule should remain consistent across web runtime and Godot runtime.

## Small Project Example

    id: tiny-rpg
    title: Tiny RPG
    settings:
      tileSize: 16
      start:
        map: town
        position: [4, 6]
    assets:
      sprites:
        hero:
          path: assets/sprites/characters/hero.png
          frameSize: [16, 16]
        mayor:
          path: assets/sprites/characters/mayor.png
          frameSize: [16, 16]
      tilesets:
        town_tiles:
          path: assets/tilesets/town.png
          tileSize: 16
    maps:
      town:
        id: town
        name: Town
        size: [20, 15]
        tileset: town_tiles
        events:
          - mayor_intro
    events:
      mayor_intro:
        id: mayor_intro
        map: town
        position: [7, 6]
        sprite: mayor
        trigger: interact
        commands:
          - type: show_message
            speaker: mayor
            text: 北の洞窟には近づくな。
          - type: set_flag
            flag: cave_warning_seen
    flags:
      cave_warning_seen:
        id: cave_warning_seen
        name: Cave warning seen

## Save State

`SaveState` should store runtime progress as serializable data:

* current map ID
* player grid position
* party state
* inventory
* flags
* switches
* variables
* defeated enemies or event-local state where needed

`SaveState` must not store runtime objects such as sprites, DOM nodes, Godot nodes, timers, or closures.

## Validation Targets

Validation should catch:

* missing referenced maps
* missing referenced tilesets
* missing referenced assets
* missing flags, switches, and variables
* invalid command payloads
* invalid coordinates
* invalid nested command structures
* duplicate IDs
* unresolved actor, enemy, item, or skill references
