# Godot Boundary

The Godot boundary exists so RPG Deck can start with a fast TypeScript prototype while keeping a future Godot runtime path open.

The TypeScript runtime is a design probe / prototype runtime. The Godot runtime is a future production candidate. The source of truth remains `packages/core-domain`.

## Ownership

`core-domain` owns:

* declarative project data
* domain types
* schemas
* validation
* event command meaning
* stable IDs
* grid coordinates
* asset manifest data
* serialization

`web-runtime` owns:

* browser rendering
* browser input
* prototype movement
* prototype collision
* prototype event execution
* browser preview state

The initial `web-runtime` implementation is intentionally headless and renderer-free. Its movement, collision, trigger, and command semantics can be used as a design probe for a future browser renderer and as reference behavior for the Godot runtime boundary.

Godot runtime owns:

* Godot nodes
* Godot sprites
* Godot scene tree usage
* Godot input mapping
* Godot physics integration
* C# runtime state
* loading exported data

`godot-export` owns:

* converting `core-domain` projects into Godot-readable output
* writing exported JSON
* preparing future `.tscn`, `.tres`, `.res`, or resource strategies when needed
* asset path conversion strategy
* stable ID to Godot runtime mapping

## Initial Export Strategy

The first Godot integration should not generate large numbers of `.tscn` files.

Use this path first:

    core-domain project
      -> godot-export
      -> godot-project/game_data/*.json
      -> Godot C# runtime reads exported JSON

This keeps the boundary clear and avoids coupling the domain format to early Godot scene-generation assumptions.

## Runtime Objects

Godot-specific objects must not enter `core-domain`.

Forbidden in domain models:

* `Node`
* `Sprite2D`
* `AnimatedSprite2D`
* `PackedScene`
* Godot resource instances
* Godot signal callbacks

Web-specific objects must not enter `core-domain`.

Forbidden in domain models:

* React components
* DOM nodes
* Canvas objects
* PixiJS sprites
* browser events
* closures for event behavior

Domain models should store stable IDs and serializable data.

## Asset Conversion

Core data uses stable asset IDs:

    sprite: mayor

The asset manifest resolves the source path:

    assets:
      sprites:
        mayor:
          path: assets/sprites/characters/mayor.png
          frameSize: [16, 16]

The exporter or Godot adapter is responsible for converting this to a Godot path such as:

    res://game_assets/sprites/characters/mayor.png

The exact output location can evolve. The rule is that runtime-specific paths are not the domain source of truth.

## Coordinate Conversion

Core coordinate convention:

    grid position = [x, y]
    x = right
    y = down
    tileSize = project setting

Runtime conversion:

    worldX = gridX * tileSize
    worldY = gridY * tileSize

Godot can map those world coordinates into its own node transforms, but the domain convention should stay stable.

## EventCommand Portability

Event behavior must be declarative `EventCommand` data. Both web runtime and Godot runtime should implement the same command meaning.

Portable command example:

    - type: show_message
      speaker: mayor
      text: 北の洞窟には近づくな。
    - type: transfer_player
      map: cave_entrance
      position: [3, 10]

Avoid runtime scripts or language-specific callbacks in event data.

## First Godot Boundary Spike

The first spike should prove the boundary, not complete a full port.

Scope:

* export `tiny-rpg` map data from `core-domain`
* export player start position
* export collision data
* read exported JSON in a Godot C# runtime
* render or otherwise represent the map enough to move a player
* allow the player to walk
* keep event execution minimal

Success criteria:

* Godot reads exported data without hand-translating the project
* player movement uses exported map and collision information
* asset IDs and coordinates survive the export boundary
* no Godot-specific objects are required in `core-domain`

Non-goals:

* complete event execution
* full editor integration
* mass `.tscn` generation
* final production runtime architecture
