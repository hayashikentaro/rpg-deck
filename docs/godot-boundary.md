# Godot Boundary Spike

This document defines the first boundary contract between RPG Deck editor/core project JSON and a future Godot C# loader.

The goal of Phase 11 is to prove that current RPG Deck project data can cross into Godot without turning Godot into the authoring source of truth. This is a boundary spike, not a Godot game implementation.

## Source of Truth

RPG Deck project JSON remains the source of truth.

The Godot spike should consume JSON copied or exported from the editor. Godot should not become the canonical project authoring surface in this spike, and there should be no Godot-specific schema fork at this step.

For now, editor import/export remains browser-based JSON:

* view current project JSON in the editor
* copy current project JSON
* paste and preview project JSON
* load project JSON back into the editor through `parseProjectJson`

The Godot loader should read the same project shape that `packages/core-domain` parses and validates. If a derived Godot export format becomes useful later, it should be introduced explicitly as an exporter output, not silently treated as the canonical schema.

## Ownership

`packages/core-domain` owns:

* declarative project data
* domain types
* schemas
* validation
* event command meaning
* stable IDs
* grid coordinates
* asset manifest data
* serialization

`packages/web-runtime` owns:

* prototype movement semantics
* prototype collision semantics
* prototype event trigger semantics
* prototype command execution
* serializable runtime snapshots

The current web runtime is intentionally headless at the behavior layer. Its movement, collision, trigger, and command behavior should inform the Godot boundary, but Godot does not import `web-runtime` code.

Godot runtime owns:

* Godot nodes
* Godot sprites
* Godot scene tree usage
* Godot input mapping
* Godot physics integration
* C# runtime state
* loading copied or exported JSON

`packages/godot-export` will eventually own:

* converting `core-domain` projects into Godot-readable output
* writing exported JSON
* preparing future `.tscn`, `.tres`, `.res`, or resource strategies when needed
* asset path conversion strategy
* stable ID to Godot runtime mapping

## Minimum JSON Contract for the First Loader

The first Godot C# loader should read current RPG Deck project JSON directly. Field names below use the current canonical JSON paths. Parenthetical names such as `mapId` or `spriteId` describe their runtime meaning, not a new schema.

### Project

Minimum fields:

* `id`
* `title`
* `settings.tileSize`
* `settings.start.map` as the start map ID
* `settings.start.position`

Coordinate rule:

* grid position is `[x, y]`
* `x` increases to the right
* `y` increases downward
* world position can start as `grid * settings.tileSize`

### Maps

Minimum fields for each `maps[mapId]` entry:

* `maps[mapId].id`
* `maps[mapId].name`
* `maps[mapId].size`
* `maps[mapId].events`
* `maps[mapId].collision`

The first loader can ignore tileset rendering, but it should preserve the map ID and size and use `collision` for blocking movement.

### Events

Minimum fields for each `events[eventId]` entry:

* `events[eventId].id`
* `events[eventId].map` as the event map ID
* `events[eventId].position`
* `events[eventId].trigger`
* `events[eventId].sprite` as an optional sprite asset ID
* `events[eventId].commands`

The first loader should use `map`, `position`, and `trigger` to place event markers and optionally detect interact or touch events. `sprite` can be ignored visually at first, but it should remain parsed or preserved as a stable asset ID.

### Commands

First-pass command types:

* `show_message`
* `choice`
* `set_flag`
* `unset_flag`
* `transfer_player`
* `start_battle`
* `play_bgm`
* `play_sfx`

The first Godot loader may initially display, log, or ignore some command effects. It should still parse command arrays enough to avoid crashing on supported RPG Deck data. Unsupported future command types should fail gracefully or be reported clearly.

Minimum first-pass command expectations:

* `show_message`: display or log speaker/text
* `choice`: display or log prompt/options; nested command execution can be deferred
* `set_flag` / `unset_flag`: update or log flag state if implemented
* `transfer_player`: move player to target map/position if implemented
* `start_battle`: show a battle placeholder or log enemy ID
* `play_bgm` / `play_sfx`: resolve or log audio asset IDs

## Asset Conversion

Core data uses stable asset IDs:

    sprite: mayor

The asset manifest resolves the source path:

    assets:
      sprites:
        mayor:
          path: assets/sprites/characters/mayor.png
          frameSize: [16, 16]

The exporter or Godot adapter is responsible for converting stable IDs to Godot paths such as:

    res://game_assets/sprites/characters/mayor.png

Runtime-specific paths are not the domain source of truth. The first Godot spike can render debug markers instead of loading sprite or tile artwork.

## Manual Export / Handoff Procedure

Until a dedicated exporter exists, the first Godot loader spike should use a manual handoff from the editor's Project JSON section.

Current workflow:

1. Start the RPG Deck editor.
2. Edit project data using Event Inspector, grid editing, collision toggle, or proposal accept.
3. Open the `Project JSON` section.
4. If JSON is coming from another source, paste it into `Import Project JSON` and use `Preview Project JSON` first.
5. Use `Copy Project JSON` to copy the current editor project.
6. Paste the copied JSON into the Godot loader spike input location.
7. The Godot loader should parse it as RPG Deck project JSON.
8. If the loader fails, first confirm the same JSON still parses through RPG Deck import/preview.

Important handoff rules:

* copied JSON is the current editor project state
* copied JSON excludes runtime snapshot, proposal state, and UI state
* copied JSON should remain valid `parseProjectJson` input
* validation should be checked before relying on the JSON in Godot
* this is a manual handoff until a dedicated exporter exists

For the first Godot spike, place copied JSON manually in a Godot-side fixture such as:

    godot_spike/data/project.json

The exact path can be chosen by the Godot spike. Treat that file as an input artifact for the spike, not as RPG Deck's canonical data. Do not commit generated handoff fixtures unless a later task explicitly asks for a fixture strategy.

## Round-Trip Sanity Check

Before handing JSON to Godot, use the editor to check the JSON can still round-trip through the RPG Deck parser:

1. Copy current `Project JSON`.
2. Paste it into `Import Project JSON`.
3. Click `Preview Project JSON`.
4. Confirm ID, title, map count, event count, flag count, and validation issue count.
5. Load it only if you intentionally want to replace the current editor project.
6. Use that same JSON for Godot handoff.

If project JSON was manually edited outside RPG Deck, preview it in the editor before handing it to Godot. If preview fails, fix the JSON at the source instead of adding Godot-specific tolerance for invalid RPG Deck project data.

## Future Automated Export

Later work may introduce:

* a dedicated exporter command
* a fixture generator
* a derived Godot-readable artifact
* asset ID to `res://` path conversion
* an optional `packages/godot-export` implementation

For now:

* no exporter package is created
* no schema fork is introduced
* no generated artifact is committed
* no Godot project structure is created by RPG Deck

## First Godot Spike Behavior

The first spike should prove the boundary, not complete a full port.

Target behavior:

* load RPG Deck project JSON
* create a simple map representation from `maps`
* place the player at `settings.start.position` on `settings.start.map`
* render collision cells in a simple debug way
* render event markers in a simple debug way
* allow grid-based player movement
* block movement using map collision
* optionally detect `interact` and `touch` events
* optionally display or log simple event command output

Success criteria:

* Godot reads project JSON without hand-translating the sample
* player movement uses project map size and collision data
* event IDs, map IDs, asset IDs, and grid coordinates survive the boundary
* malformed or unsupported data fails gracefully
* no Godot-specific objects are required in `core-domain`

## Validation Expectations

Before sending JSON to Godot:

* JSON should parse with `parseProjectJson`
* project data should be checked with `validateProject`
* the editor Project JSON preview can show validation issue count before loading

The Godot loader should still defend itself:

* malformed JSON should not crash the Godot runtime
* missing maps, invalid start positions, or unsupported commands should produce clear debug errors
* the loader should not assume every future command type is executable

Validation remains owned by `packages/core-domain`. This documentation step does not change validation code.

## Non-Goals

This boundary step does not include:

* full Godot game implementation
* Godot editor tooling
* bidirectional editing
* save back from Godot
* schema fork
* tile artwork requirement
* sprite animation requirement
* full dialogue UI
* battle implementation
* AI integration
* file persistence changes in RPG Deck
* changes to `core-domain`
* changes to `web-runtime`
* changes to editor import/export behavior
* mass `.tscn` generation

## Open Questions

Open questions for later spikes:

* Should Godot read raw RPG Deck JSON directly, or should `packages/godot-export` produce a derived export later?
* Which `EventCommand` types should Godot interpret in the first executable spike versus only display or log?
* What asset mapping layer should convert sprite, tileset, and audio IDs into `res://` paths?
* Should runtime semantics be shared by generated data, reimplemented in Godot C#, or tested against web-runtime snapshots?
* How much of choice/message stepping should the first Godot spike support?
