# Godot Command Execution Boundary

## Purpose

This note defines the boundary for moving the Godot spike from log/status-only event detection toward limited event command execution.

The goal is not to port every RPG Deck runtime behavior at once. The goal is to make command handling explicit, deterministic, and reviewable before Godot adds runtime state or UI that could be mistaken for a complete game implementation.

## Current State

The Godot spike currently:

* loads copied or exported RPG Deck Project JSON
* detects `interact` and `touch` events
* reports event id and position in the Output log and debug status HUD
* does not inspect, preview, or execute event command effects

The next phase should preserve event detection behavior and add command visibility before adding command effects.

## Source of Truth

RPG Deck Project JSON remains the source of truth for event command data.

Godot consumes the existing declarative `EventCommand` objects. It must not introduce a Godot-specific command schema, write command changes back to Project JSON, or become an authoring source in this phase.

`packages/core-domain` owns command shapes and domain meaning. The existing `packages/web-runtime` behavior can inform expected semantics, but Godot does not import web runtime code and should not silently claim semantic parity without explicit verification.

## Command Categories

Godot command handling should use four explicit categories:

* **Log-only command preview**: parse the command and show a concise deterministic description without applying an effect.
* **Stub / placeholder**: show that the command was reached, but deliberately use a debug placeholder instead of a real subsystem.
* **Executable later**: the command is a reasonable future effect after its runtime state and sequencing boundary is designed.
* **Out of scope for the first executable spike**: do not execute the command while the first `show_message` path is being proven.

All known command types should be safe to preview even when they are not executable. Previewing a command must not mutate player, map, flag, inventory, audio, battle, or UI state.

## First Executable Spike Recommendation

The smallest safe next implementation is:

1. Keep `interact` and `touch` event detection as-is.
2. When an event is detected, inspect its top-level `commands` array.
3. Add a log/status command preview that reports command index, type, and a concise payload summary.
4. Do not execute every command in the array.
5. Implement only `show_message` as the first executable command.
6. Display `show_message` through a minimal debug message panel or equivalent visible spike UI.
7. Require an explicit advance input before continuing past a displayed message if command sequencing is introduced.
8. Leave choices, flags, conditions, inventory, transfer, battle, and audio as preview or placeholder behavior.

This path proves that Godot can read a command payload and present a visible effect without prematurely defining every runtime subsystem.

The debug status HUD is not sufficient as the final `show_message` surface because movement and interaction status can replace its text. A separate debug message panel is acceptable for the spike, but it is not a full dialogue UI.

## Command Type Matrix

The current `EventCommand` union includes the following command types.

| Command type | Category after preview | First executable spike | Later prerequisite |
| --- | --- | --- | --- |
| `show_message` | First executable candidate | Implement a minimal debug message panel for speaker and text | Explicit message advance and command sequence pause/resume |
| `choice` | Log-only command preview; executable later | Explicitly out of scope | Choice input, focus, selection, nested command sequencing |
| `set_flag` | Executable later | Explicitly out of scope | Local flag state, initialization, inspection, and deterministic sequencing |
| `unset_flag` | Executable later | Explicitly out of scope | Local flag state, initialization, inspection, and deterministic sequencing |
| `if_flag` | Executable later | Explicitly out of scope | Flag state plus nested branch sequencing |
| `give_item` | Executable later | Explicitly out of scope | Local inventory state and quantity rules |
| `take_item` | Executable later | Explicitly out of scope | Local inventory state and quantity rules |
| `transfer_player` | Stub / placeholder; executable later | Explicitly out of scope | Current map replacement, player placement validation, grid rebuild, and post-transfer trigger rules |
| `start_battle` | Stub / placeholder | Explicitly out of scope | Battle boundary and return-to-map behavior |
| `play_bgm` | Stub / placeholder; executable later | Explicitly out of scope | Asset ID resolution, audio lifecycle, and Godot audio node ownership |
| `play_sfx` | Stub / placeholder; executable later | Explicitly out of scope | Asset ID resolution and Godot audio node ownership |

For command preview, payload summaries should use stable domain IDs and values, for example:

* `show_message`: speaker and text
* `choice`: prompt and option labels, without executing nested commands
* flags and conditions: flag ID
* inventory commands: item ID and quantity
* `transfer_player`: map ID and grid position
* `start_battle`: enemy ID
* audio commands: audio asset ID

## Runtime State Boundary

Godot runtime state should remain local and non-authoritative.

Initial local runtime state already includes:

* current map ID
* player grid position
* player facing direction

Later command execution may add:

* current message and pending command position
* flags
* inventory
* current audio state
* battle placeholder state

This state is runtime-only. Godot must not write it back into RPG Deck Project JSON, mutate the copied handoff file, or imply save-back support.

Before executing commands that depend on ordering or pause/resume behavior, define how a command sequence advances after a message, choice, transfer, or placeholder. Nested commands must not be executed accidentally as part of command preview.

## UI Boundary

The existing debug status HUD reports the latest movement or event detection result. It is not dialogue UI.

A simple debug message panel is acceptable for the first `show_message` executable spike when it:

* displays speaker and text
* is visibly separate from movement/interact status
* makes message active/inactive state clear
* uses an explicit advance action if command sequencing continues after the message

Choice UI requires a separate design for focus, input ownership, selected option, cancellation, and nested commands. It must not be added implicitly while implementing `show_message`.

## Asset / Audio Boundary

Project JSON refers to assets by stable IDs. Godot-specific `res://` paths are not part of the domain command schema.

`play_bgm` and `play_sfx` should remain placeholders until an explicit asset mapping layer defines:

* stable asset ID to Godot resource path conversion
* missing asset behavior
* BGM replacement and stop behavior
* audio node ownership and lifecycle

The first executable spike does not require audio playback, sprite assets, or tile assets.

## Failure Behavior

Command handling must remain defensive:

* unknown command types should report `unsupported_command` with command index and type when available
* malformed commands should report a concise error and not crash
* unsupported commands should not block movement or event detection unless explicitly designed
* command preview should continue deterministically where safe
* command execution should produce visible debug output so the reached command and result can be confirmed
* one malformed or unsupported command must not be treated as permission to invent a Godot-specific fallback schema

When execution is added, the implementation should make the stop/continue rule explicit for every supported command type.

## Non-Goals

This design note does not include:

* command execution implementation
* full dialogue UI
* choice UI or nested choice command execution
* flag or condition execution
* inventory execution
* player transfer
* battle implementation
* audio playback
* save-back or bidirectional editing
* a Godot-specific schema fork
* changes to `core-domain` or `web-runtime`

## Open Questions

* Should command preview show only top-level commands or recursively summarize nested commands without executing them?
* What input advances a debug message, and should movement be disabled while a message is active?
* Should the first command sequence stop after the first executable `show_message`, or resume after explicit advance?
* How should Godot compare its future command semantics against `web-runtime` behavior?
* When flags are added, should their initial values come only from runtime defaults or from a future explicit save-state input?
* What exported artifact or adapter should eventually resolve stable asset IDs to Godot resources?

## Recommended Next Implementation Prompt

Implement a Godot command preview step without changing Project JSON or executing command effects:

* extend the current event summary extraction to retain each detected event's command array
* after `interact` or `touch` detection, log/status-preview each top-level command with index, type, and concise payload
* handle unknown or malformed commands without crashing
* do not execute commands, nested commands, flags, transfer, battle, or audio
* keep movement, collision, event detection, and host verification behavior unchanged

After command preview is manually verified, create a separate implementation task for a minimal `show_message` debug message panel.
