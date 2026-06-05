# Godot Boundary Spike Closeout

## Purpose

This note closes out the first Phase 11 Godot boundary spike. It records what the spike proved, what was host verified, and what remains intentionally outside the boundary before any further Godot runtime work.

The spike is a boundary proof, not a full RPG runtime.

## Acceptance Summary

Phase 11 first Godot boundary spike acceptance is satisfied.

The accepted first spike proves that:

* Godot can consume copied or exported RPG Deck Project JSON without a Godot-specific schema fork.
* Godot can render the current map, collision cells, event markers, player position, and player facing from that JSON.
* Godot can run basic grid movement with map bounds and collision blocking.
* Godot can detect `interact` and `touch` events from event trigger and position data.
* Godot can preview top-level event commands without applying command effects.
* Godot can display the first top-level `show_message` in a debug message panel.
* The Godot runtime remains non-authoritative and does not save data back to RPG Deck.

## What Was Proven

Project JSON can cross the TypeScript/Godot boundary while preserving the IDs and coordinates needed for the first runtime spike:

* map IDs
* event IDs
* event triggers
* command types
* stable asset IDs referenced by commands
* grid coordinates for player, events, map size, and collision

The host verification workflow is stable enough for manual QA:

* `pnpm godot` is the standard command.
* `pnpm godot` performs build then run.
* Apple Silicon Godot/.NET architecture alignment works through the host verification script.

The debug display is readable enough for manual verification:

* scaled debug display is readable
* debug window sizing prevents bottom clipping
* legend, status, message panel, and grid do not overlap

## Host Verified Behaviors

The following host Godot run examples are recorded:

```text
touch_event: touch_test at [5, 6]
command_preview: touch_test commands=0
interact_event: mayor_intro at [7, 6]
Status: command_preview: mayor_intro commands=4
Message: mayor_intro: 北の洞窟には近づくな。
```

`mayor_intro` command preview includes:

* `play_bgm`
* `play_sfx`
* `show_message`
* `choice`

The host run also verified that:

* startup displays `Message: <none>`
* movement works with arrow keys and WASD
* map bounds block movement
* `#` collision cells block movement
* touch detection does not run on blocked movement
* choice UI does not appear
* BGM/SFX do not play
* command effects are not executed

## Boundary Guarantees

The first spike preserves these boundary guarantees:

* RPG Deck Project JSON remains the source of truth.
* Godot consumes copied or exported Project JSON.
* Godot does not save back to RPG Deck Project JSON.
* There is no Godot-specific schema fork.
* No TypeScript domain changes were needed for the first spike.
* Local handoff JSON is ignored and non-canonical.
* Generated Godot files are local artifacts and are not canonical.

## Non-Goals Still Preserved

The closeout does not claim support for:

* message sequencing
* message advance input
* full dialogue UI
* choice UI or choice execution
* flags
* inventory
* transfer
* battle/audio
* full command execution
* save-back or bidirectional editing
* Godot-specific project authoring
* Godot-specific schema fork

The debug message panel is not dialogue UI. It only displays the first top-level `show_message` from the most recently detected event.

## Local Handoff JSON Note

Host touch verification used ignored local handoff file `godot_spike/data/project.json`.

That local file included:

* event id: `touch_test`
* trigger: `touch`
* map: `town`
* position: `[5, 6]`
* commands: `[]`

The file is not canonical, is not committed, and should be regenerated or copied from the RPG Deck editor as needed for future host verification.

## Risks / Caveats

Remaining caveats:

* Godot verification is manual QA only; there is no automated Godot test yet.
* Host verification requires local `godot_spike/data/project.json`.
* The debug UI is text-only and is not product UI.
* The message panel is not full dialogue UI.
* Command preview is not semantic parity with `packages/web-runtime`.
* Message sequencing and advance input are not designed yet.
* Transfer and map switching are not implemented.
* Asset and audio resolution are not implemented.

## Recommended Next Phase Options

### Option A: Stop Phase 11 First Spike Here

Treat the first Godot boundary spike as accepted and return to editor/runtime work. This is appropriate if the current goal was only to prove the data boundary and host verification loop.

### Option B: Design Sequencing Before More Commands

Write an explicit message sequencing and advance-input design before implementing more command effects. Do not implement choices, flags, transfer, audio, inventory, or battle until the command sequencing and runtime state boundary are designed.

### Option C: Improve Godot Spike Robustness / QA

Keep gameplay scope fixed and harden verification only. Possible work includes clearer debug diagnostics, more defensive malformed-command reporting, or a plan for automated Godot smoke checks.

Future work should follow the classic RPG architecture and AI work boundary docs before expanding beyond this Field spike.

Recommended next step if continuing Godot runtime work: choose one option explicitly before implementation.

## Links to Future Architecture Docs

Use these docs to choose and scope the next phase:

* [Classic RPG architecture plan](./architecture/classic-rpg-architecture-plan.md)
* [AI work boundaries](./architecture/ai-work-boundaries.md)
* [Dependency boundaries](./architecture/dependency-boundaries.md)
* [Scene mode](./runtime/scene-mode.md)
* [Runtime state](./runtime/runtime-state.md)
* [Command sequencing](./runtime/command-sequencing.md)
