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

The next command-handling phase is defined separately in [`godot-command-boundary.md`](./godot-command-boundary.md). That note keeps event command work scoped to command preview first, followed by a minimal `show_message` executable spike.

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

## Current Skeleton

The repository now includes `godot_spike/` as a non-canonical executable spike area.

Current skeleton files:

* `godot_spike/project.godot`
* `godot_spike/scenes/ProjectLoaderScene.tscn`
* `godot_spike/data/README.md`
* `godot_spike/scripts/ProjectLoader.cs`

The expected manual handoff input path is:

    godot_spike/data/project.json

`ProjectLoader.cs` loads `res://data/project.json`, parses JSON with Godot APIs, and logs a concise project summary:

* project id
* project title
* start map
* start position
* map count
* event count
* current map size
* current map collision count
* current map event count

`project.godot` sets `res://scenes/ProjectLoaderScene.tscn` as the main scene. Running the project executes `ProjectLoader.cs` on a plain `Node`.

The loader extracts these values defensively so missing or malformed fields warn and fall back instead of crashing. It also extracts current-map collision positions plus event id, trigger, and position for debug rendering and log/status-only event detection. The `godot_spike/` directory is not an authoring source and must not become a schema fork.

The spike now renders a static debug grid for the current/start map when valid map size data is available. The grid uses text markers only: `^`, `v`, `<`, and `>` for player facing, `E` for events, `#` for collision, and `.` for empty cells. It includes a visible legend, and `ProjectLoader` exposes `DebugCellSize` and `DebugMapOffset` so the grid spacing can be adjusted in the inspector.

The spike also supports minimal player marker movement on the debug grid. The initial position comes from `settings.start.position`, arrow keys and WASD move the player marker within map bounds, and cells restore their underlying `E`, `#`, or `.` marker when the player leaves. Facing direction updates from movement input even when movement is blocked by map bounds or collision. Collision cells from RPG Deck project JSON block debug player movement.

The spike can detect a `trigger: interact` event in the player's facing cell when Enter, Space, or Z is pressed, and it can detect a `trigger: touch` event after the player successfully enters its cell. Both paths log and display the event id and position, then preview each top-level command by index, type, and concise payload summary. The debug viewport status line shows the latest movement, event detection, or command preview result so manual verification does not depend only on the Output log. Command effects, dialogue UI, and command execution remain out of scope.

For mounted-repository host verification, prepare `godot_spike/data/project.json` from inside the container and use `pnpm godot` as the standard implementation verification command. It performs a headless C# build and launches the project only when the build succeeds; run-only remains available as `pnpm godot:run`. The underlying `godot_spike/scripts/host_verify.sh` supports the same workflow. Host-specific Godot, .NET, or architecture settings should come from `GODOT_BIN`, `DOTNET_ROOT`, `GODOT_ARCH`, or ignored `godot_spike/.env.local`, not tracked absolute paths. The script can force the effective Godot architecture so an x86_64 Node or pnpm process does not select an incompatible runtime on Apple Silicon. Local Godot outputs such as `.godot/`, `.mono/`, `.csproj`, `.sln`, the handoff `data/project.json`, and `.env.local` are ignored and non-canonical.

## Current Verification Status

Implemented in the repository:

* Project JSON loading and defensive project summary extraction
* current map size, collision, and event id/trigger/position extraction
* debug grid, marker legend, status HUD, and player start placement
* four-direction movement, facing display, map bounds blocking, and collision blocking
* log/status-only `interact` detection in the facing cell
* log/status-only `touch` detection after successful cell entry
* log/status-only top-level command preview after event detection
* portable host verification script and `pnpm godot` build-then-run workflow

Manually verified on a host:

* `pnpm godot` performs build then run
* Apple Silicon Godot/.NET architecture alignment works
* debug grid, legend, status HUD, and markers are visible without layout overlap
* `interact` detection displays `interact_event: mayor_intro at [7, 6]`

Touch verification is prepared through ignored local `godot_spike/data/project.json` using `touch_test` on `town` at `[5, 6]`. That local handoff artifact is not canonical and is not committed.

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

## Loader Acceptance Checklist

Use this checklist to keep the first Godot loader spike small. Passing these items is enough for Phase 11 minimum success.

Status labels:

* **Implemented**: behavior exists in tracked source
* **Host verified**: behavior has also been confirmed in a host Godot run
* **Prepared**: manual verification input exists locally, but verification is not recorded as complete
* **Pending**: not implemented or not required yet

### Project Loading

* **Implemented**: loader accepts RPG Deck project JSON copied from the editor
* **Implemented**: malformed JSON fails gracefully with a visible or debug error
* **Implemented**: unsupported future fields do not crash the loader

### Map Loading

* **Implemented**: loader reads `settings.start.map`
* **Implemented**: loader creates the current map from `maps`
* **Implemented**: loader respects `maps[mapId].size`
* **Pending**: loader can switch map if `transfer_player` is supported later

### Player

* **Implemented**: player starts at `settings.start.position`
* **Implemented**: player grid movement works in four directions
* **Implemented**: player facing is displayed and updates even when movement is blocked
* **Implemented**: player cannot move outside map bounds
* **Implemented**: player cannot move into `collision`

### Collision

* **Implemented**: collision cells are visible in debug rendering
* **Implemented**: movement into collision is blocked
* **Implemented**: removing collision in RPG Deck JSON and reloading allows movement

### Events

* **Implemented**: event markers are placed using event `map` and `position`
* **Implemented**: event id, trigger, and position are extracted for the current map
* **Host verified**: `interact` event detection reports `mayor_intro` from the adjacent facing cell
* **Implemented / Prepared**: `touch` event detection reports an event after successful cell entry; ignored local `touch_test` input is ready for host verification
* **Implemented**: event detection is log/status-only and does not execute commands
* **Pending**: unsupported trigger behavior reporting beyond defensive parsing

### Commands

* **Implemented**: command execution boundary design note
* **Implemented**: log/status-only top-level command preview after `interact` or `touch` detection
* **Pending**: `show_message`, `choice`, flags, transfer, battle, and audio behavior
* **Pending**: full command execution; it remains out of scope until explicitly designed

### Boundary

* **Implemented**: no Godot-specific schema is required in RPG Deck project JSON
* **Implemented**: no changes to `core-domain` are required for first loader
* **Implemented**: no save-back from Godot is required
* **Host verified**: `pnpm godot` performs build then run with Apple Silicon architecture support

### Manual QA Flow

Manual QA is enough for the first loader spike.

1. Copy current Project JSON from the RPG Deck editor.
2. Put it into the Godot spike input location.
3. Start the Godot spike.
4. Confirm map size/debug grid.
5. Confirm player start position.
6. Confirm collision blocks movement.
7. Confirm event marker appears.
8. Confirm facing-cell `interact` detection reports an event id and position.
9. Confirm detected event top-level commands are previewed by index, type, and concise payload without effects.
10. Use an ignored local handoff JSON with a current-map `touch` event and confirm entry detection reports an event id and position.
11. Confirm an empty command array reports `commands=0`.
12. Modify collision or event position in RPG Deck.
13. Copy Project JSON again.
14. Reload the Godot spike input.
15. Confirm the change appears.

### Not Required for First Acceptance

The first loader does not need:

* sprite artwork
* animation
* full dialogue UI
* choice UI
* flag changes
* player transfer
* battle
* audio playback
* event blocking
* event command execution
* save/load from Godot
* Godot editor tooling
* bidirectional editing
* generated scenes/resources
* exporter package

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
* How should the command preview and first `show_message` executable spike be verified against the command boundary design note?
* What asset mapping layer should convert sprite, tileset, and audio IDs into `res://` paths?
* Should runtime semantics be shared by generated data, reimplemented in Godot C#, or tested against web-runtime snapshots?
* How much of choice/message stepping should the first Godot spike support?
