# RPG Deck Godot Spike

This directory is a minimal executable boundary spike for loading RPG Deck Project JSON in Godot.

It is not the canonical authoring source. RPG Deck Project JSON remains the source of truth in `packages/core-domain` and the editor. This spike consumes copied project JSON and should not save data back to RPG Deck.

Non-goals for this skeleton:

* no bidirectional editing
* no schema fork
* no full game implementation
* no map rendering yet
* no player movement yet
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

## Current Skeleton

The committed `scenes/ProjectLoaderScene.tscn` only runs `ProjectLoader.cs` on a plain `Node`.

`ProjectLoader.cs` only reads, parses, and logs a project summary. Map rendering, player movement, collision behavior, event interaction, and command execution are intentionally left for later Phase 11 steps.

Godot may create local generated files such as `.godot/`, `.csproj`, or `.sln` while opening or running the project. Do not commit those files unless a later task explicitly approves them.
