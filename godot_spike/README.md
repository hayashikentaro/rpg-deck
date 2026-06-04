# RPG Deck Godot Spike

This directory is a minimal executable boundary spike for loading RPG Deck Project JSON in Godot.

It is not the canonical authoring source. RPG Deck Project JSON remains the source of truth in `packages/core-domain` and the editor. This spike consumes copied project JSON and should not save data back to RPG Deck.

Non-goals for this skeleton:

* no bidirectional editing
* no schema fork
* no full game implementation
* no collision behavior yet
* no event interaction yet
* no command execution yet
* no saved fixture JSON committed in this step

## Manual Setup

1. Open the RPG Deck editor.
2. Confirm the current project JSON with `Preview Project JSON` if needed.
3. Copy the current project JSON from the editor's `Project JSON` section.
4. Place the copied JSON manually at `godot_spike/data/project.json`.
5. Open `godot_spike` in Godot.
6. Run the project.
7. Confirm the loader logs project id, title, start map, start position, map count, and event count.

If `data/project.json` is missing, the loader should report a clear warning and not crash.

## Host-side verification from mounted repo

When this repository is mounted into the Codex container, prepare local handoff files from inside the container before opening Godot on the host.

1. Ask Codex to refresh `godot_spike/data/project.json` from the sample project or from the current editor Project JSON.
2. On the host, open `godot_spike/project.godot` in Godot.
3. Run the project.
4. Avoid manually editing repository files from the host during verification.
5. After host verification, ask Codex to run `git status --short` again.

`godot_spike/data/project.json` is a local ignored handoff file. Godot may also create `.godot/`, `.csproj`, `.sln`, `.mono/`, or other local generated files while opening or running the project. These files are non-canonical and should not be committed unless a later task explicitly approves them.

## Manual Verification

1. Copy Project JSON from the RPG Deck editor.
2. Place it at `godot_spike/data/project.json`.
3. Open `godot_spike` in Godot.
4. Run the project.
5. Confirm the output logs:
   * project id
   * project title
   * start map
   * start position
   * map count
   * event count
   * current map size
   * current map collision count
   * current map event count
6. Confirm a static debug grid appears when the current map size is valid.
7. Confirm the legend appears above the grid and explains marker meanings:
   * `P` player start
   * `E` event
   * `#` collision
   * `.` empty
8. Press arrow keys or WASD and confirm `P` moves within map bounds.
9. Confirm `#` cells are still visual only and do not block movement yet.
10. Adjust `DebugCellSize` or `DebugMapOffset` on `ProjectLoader` in the inspector if the grid needs spacing changes.
11. Rename or remove `data/project.json`.
12. Run the project again.
13. Confirm the missing-file warning appears and the project does not crash.

## Current Skeleton

The committed `scenes/ProjectLoaderScene.tscn` is the configured main scene. It only runs `ProjectLoader.cs` on a plain `Node`.

`ProjectLoader.cs` reads, parses, extracts first-loader summary data, logs a project summary, renders a debug grid for the current/start map, and moves the `P` marker with arrow keys or WASD. The debug renderer includes a marker legend, a configurable `DebugCellSize`, and a configurable `DebugMapOffset`. Marker priority is `P` over `E` over `#` over `.`. Movement is limited by map bounds. Collision cells, event markers, event interaction, and command execution are intentionally left for later Phase 11 steps.

Godot may create local generated files such as `.godot/`, `.csproj`, `.sln`, or other local files while opening or running the project. Do not commit generated files unless a later task explicitly approves them.
