# RPG Deck Godot Spike

This directory is a minimal executable boundary spike for loading RPG Deck Project JSON in Godot.

It is not the canonical authoring source. RPG Deck Project JSON remains the source of truth in `packages/core-domain` and the editor. This spike consumes copied project JSON and should not save data back to RPG Deck.

Non-goals for this skeleton:

* no bidirectional editing
* no schema fork
* no full game implementation
* no full event command execution
* no dialogue, choice, flag, transfer, battle, or audio behavior
* no saved fixture JSON committed in this step

## Manual Setup

1. Open the RPG Deck editor.
2. Confirm the current project JSON with `Preview Project JSON` if needed.
3. Copy the current project JSON from the editor's `Project JSON` section.
4. Place the copied JSON manually at `godot_spike/data/project.json`.
5. From the repository root, run `pnpm godot`.
6. Confirm the project builds and runs.
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
pnpm godot:verify
pnpm godot:run
pnpm godot:verbose
pnpm godot:verbose-run
pnpm godot:build
pnpm godot:editor
```

`pnpm godot` and `pnpm godot:verify` are the standard implementation verification workflow: they run a headless C# build and launch the project only if the build succeeds. `pnpm godot:run` is run-only. `pnpm godot:verbose` builds and then launches a verbose run that writes `/tmp/rpg-deck-godot-run.log`, while `pnpm godot:verbose-run` is verbose run-only. `pnpm godot:build` is build-only, and `pnpm godot:editor` opens the Godot editor.

The underlying script can also be called directly:

```bash
./godot_spike/scripts/host_verify.sh verify
./godot_spike/scripts/host_verify.sh verbose-verify
./godot_spike/scripts/host_verify.sh run
./godot_spike/scripts/host_verify.sh verbose
./godot_spike/scripts/host_verify.sh build
./godot_spike/scripts/host_verify.sh editor
```

Direct script execution without a mode defaults to `verify`.

Host-specific paths can be passed as environment variables:

```bash
GODOT_BIN=/path/to/Godot DOTNET_ROOT=/path/to/dotnet GODOT_ARCH=arm64 pnpm godot
```

Or put them in ignored local file `godot_spike/.env.local`:

```bash
GODOT_BIN=/Applications/Godot_mono.app/Contents/MacOS/Godot
DOTNET_ROOT=/usr/local/share/dotnet
GODOT_ARCH=arm64
```

The script falls back to common macOS Godot and .NET locations when env vars are not set. On macOS arm64 hosts, including Rosetta-translated shells, it defaults the effective Godot architecture to `arm64` and launches through `arch -arm64`; set `GODOT_ARCH` explicitly when a different architecture is required. This keeps `pnpm godot` from inheriting an incompatible Node or pnpm process architecture. `.env.local` is ignored and must not be committed. `godot_spike/data/project.json` must already exist locally; the script checks for it but does not create it.

## Current Behavior

The spike consumes copied or exported RPG Deck Project JSON from ignored local file `godot_spike/data/project.json`. Project JSON remains the source of truth; Godot does not edit or save it back.

The debug HUD shows a legend, status line, debug message panel, and grid. It is intentionally scaled up for host verification readability, and the spike sizes the debug window so the scaled grid fits. Markers are `^`, `v`, `<`, and `>` for player facing, `E` for events, `#` for collision, and `.` for empty cells.

Current log/status-only behavior:

* arrow keys and WASD move the player marker
* facing updates even when movement is blocked
* map bounds and `#` collision cells block movement
* Enter, Space, or Z detects a `trigger: interact` event in the facing cell
* successful entry into a `trigger: touch` event cell detects that event
* detected events preview each top-level command by index, type, and concise payload summary
* command preview remains Output log and debug status only
* the debug message panel displays the first top-level `show_message` from the most recently detected event
* all other command effects remain unexecuted
* non-touch movement keeps the normal movement status; there is no `touch_event: none` output
* blocked movement does not run touch detection

The command-handling boundary is documented in [`docs/godot-command-boundary.md`](../docs/godot-command-boundary.md). The message panel is a spike UI, not full dialogue UI: it has no advance input, sequencing, choices, or movement blocking.

## Current Manual Verification Status

Verified on a host Godot run:

* `pnpm godot` performs build then run
* Apple Silicon Godot/.NET architecture alignment works
* scaled debug display is easier to read
* debug window sizing prevents bottom clipping of the scaled grid
* grid, legend, status line, and facing markers are visible without layout overlap
* startup message panel displays `Message: <none>`
* movement and collision blocking remain working
* collision blocking displays `movement_blocked: collision [2, 1] facing up`
* touch detection displays `touch_event: touch_test at [5, 6]`
* an empty touch command array displays `command_preview: touch_test commands=0`
* interact detection displays `interact_event: mayor_intro at [7, 6]`
* a facing cell without an interact event displays `interact_event: none at [5, 6]`
* `mayor_intro` command preview reports `play_bgm`, `play_sfx`, `show_message`, and `choice`
* after `mayor_intro` interact, status displays `Status: command_preview: mayor_intro commands=4`
* after `mayor_intro` interact, the debug message panel displays `Message: mayor_intro: 北の洞窟には近づくな。`
* the message panel displays the first top-level `show_message` speaker and text
* command effects did not run during command preview or message panel verification
* no choice UI appears, and BGM/SFX do not play

Touch verification used ignored local handoff JSON with `touch_test` on `town` at `[5, 6]`, `trigger: touch`, and `commands: []`. That file is non-canonical and is not committed.

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
7. Confirm the window is large enough for the scaled grid and the legend, `Status: ready` status line, and `Message: <none>` debug message panel appear above the grid.
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
15. Confirm the Output log previews that event's top-level commands and the status line shows the command count.
16. Use Project JSON with a `trigger: touch` event on the current map and move onto its cell.
17. Confirm `ProjectLoader` logs and shows `touch_event: <event_id> at [x, y]` only after entering that cell.
18. Confirm an event with an empty command array shows `command_preview: <event_id> commands=0`.
19. Confirm an event with a top-level `show_message` displays its first speaker and text in the debug message panel.
20. Confirm no dialogue UI, message sequencing, flag change, transfer, battle, or audio behavior occurs.
21. Adjust `DebugUiScale`, `DebugCellSize`, or `DebugMapOffset` on `ProjectLoader` in the inspector if the grid needs spacing changes.
22. Rename or remove `data/project.json`.
23. Run the project again.
24. Confirm the missing-file warning appears and the project does not crash.

## Current Skeleton

The committed `scenes/ProjectLoaderScene.tscn` is the configured main scene. It only runs `ProjectLoader.cs` on a plain `Node`.

`ProjectLoader.cs` reads, parses, extracts first-loader summary data, logs a project summary, renders a debug grid for the current/start map, and provides log/status-only event detection plus top-level command preview. The debug HUD places the marker legend first, the status line and debug message panel below it, and the grid below the HUD. The renderer includes a configurable `DebugUiScale`, `DebugCellSize`, and `DebugMapOffset`; by default the HUD and grid render at roughly double the base layout size. The runtime also sizes the debug window from the scaled grid dimensions with a minimum of `1280x960`. Marker priority is player over `E` over `#` over `.`. The first top-level `show_message` is displayed without sequencing; dialogue UI, choices, flags, transfer, battle/audio, and all other command effects are intentionally left for later Phase 11 steps.

Godot may create local generated files such as `.godot/`, `.csproj`, `.sln`, or other local files while opening or running the project. Do not commit generated files unless a later task explicitly approves them.

Godot may also update tracked source metadata such as `project.godot` C# settings or small `.uid` resource identity files. Review those diffs before committing them.
