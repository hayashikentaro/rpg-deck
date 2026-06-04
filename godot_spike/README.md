# RPG Deck Godot Spike

This directory is a minimal executable boundary spike for loading RPG Deck Project JSON in Godot.

It is not the canonical authoring source. RPG Deck Project JSON remains the source of truth in `packages/core-domain` and the editor. This spike consumes copied project JSON and should not save data back to RPG Deck.

Non-goals for this skeleton:

* no bidirectional editing
* no schema fork
* no full game implementation
* no command-backed event interaction yet
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

## Host Verification Script

From the repository root, run:

```bash
pnpm godot
```

Supported modes:

```bash
pnpm godot
pnpm godot:run
pnpm godot:verbose
pnpm godot:build
pnpm godot:editor
```

`run` is the default mode. `verbose` writes `/tmp/rpg-deck-godot-run.log`, `build` runs a headless C# build, and `editor` opens the Godot editor.

The underlying script can also be called directly:

```bash
./godot_spike/scripts/host_verify.sh run
./godot_spike/scripts/host_verify.sh verbose
./godot_spike/scripts/host_verify.sh build
./godot_spike/scripts/host_verify.sh editor
```

Host-specific paths can be passed as environment variables:

```bash
GODOT_BIN=/path/to/Godot DOTNET_ROOT=/path/to/dotnet pnpm godot
```

Or put them in ignored local file `godot_spike/.env.local`:

```bash
GODOT_BIN=/Applications/Godot_mono.app/Contents/MacOS/Godot
DOTNET_ROOT=/usr/local/share/dotnet
```

The script falls back to common macOS Godot and .NET locations when env vars are not set. `.env.local` is ignored and must not be committed. `godot_spike/data/project.json` must already exist locally; the script checks for it but does not create it.

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
7. Confirm the legend and `Status: ready` debug status line appear above the grid.
8. Confirm the legend explains marker meanings:
   * `^`, `v`, `<`, `>` player facing
   * `E` event
   * `#` collision
   * `.` empty
9. Press arrow keys or WASD and confirm the player marker moves within map bounds.
10. Confirm the player marker changes facing direction when movement input is pressed, including blocked movement.
11. Confirm the debug status line shows successful movement or the blocked reason.
12. Confirm the player marker cannot move into `#` collision cells.
13. Face an `E` event marker and press Enter, Space, or Z.
14. Confirm `ProjectLoader` logs and shows `interact_event: <event_id> at [x, y]` only when the facing cell has a `trigger: interact` event.
15. Adjust `DebugCellSize` or `DebugMapOffset` on `ProjectLoader` in the inspector if the grid needs spacing changes.
16. Rename or remove `data/project.json`.
17. Run the project again.
18. Confirm the missing-file warning appears and the project does not crash.

## Current Skeleton

The committed `scenes/ProjectLoaderScene.tscn` is the configured main scene. It only runs `ProjectLoader.cs` on a plain `Node`.

`ProjectLoader.cs` reads, parses, extracts first-loader summary data, logs a project summary, renders a debug grid for the current/start map, and moves a facing marker with arrow keys or WASD. The debug renderer includes a marker legend, a debug status line, a configurable `DebugCellSize`, and a configurable `DebugMapOffset`. Player markers use ASCII `^`, `v`, `<`, and `>` for font-safe facing display. Marker priority is player over `E` over `#` over `.`. Facing updates even when movement is blocked. Movement is limited by map bounds and `#` collision cells. Pressing Enter, Space, or Z checks the facing cell for a `trigger: interact` event and logs the event id when found. The status line mirrors the latest movement or interact result in the viewport; it is not dialogue UI. Event commands, dialogue UI, touch events, and command execution are intentionally left for later Phase 11 steps.

Godot may create local generated files such as `.godot/`, `.csproj`, `.sln`, or other local files while opening or running the project. Do not commit generated files unless a later task explicitly approves them.

Godot may also update tracked source metadata such as `project.godot` C# settings or small `.uid` resource identity files. Review those diffs before committing them.
