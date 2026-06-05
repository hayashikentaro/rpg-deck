# Command Sequencing

## Purpose

This document defines the future boundary for executing event commands in a deterministic classic RPG runtime.

## Current Godot Spike Relation

The Godot boundary spike:

* previews detected event top-level commands
* displays the first top-level `show_message`
* does not sequence commands
* has no advance input
* has no full dialogue UI
* does not execute command effects

## Sequencing Model

Future command execution should use explicit state:

* command queue/list
* command pointer
* active event id
* call stack or nested command context
* pause/resume state
* pending message
* pending choice
* emitted runtime effects

## Pause / Resume

Commands that require user input must pause the sequence:

* `show_message` pauses until message advance
* `choice` pauses until option selection
* transition may pause until visual transition completes
* battle may replace the active base scene and resume only through a defined result path

## Nested Commands

Nested commands exist in choices and conditions. They must not be executed by accident during command preview.

Nested execution needs:

* deterministic option selection
* branch stack
* clear return behavior
* visible debug output

## Transfer Boundaries

`transfer_player` affects current map, player position, grid rebuild, event detection, and transition state.

Do not implement transfer as a direct UI jump. It should emit a runtime action/effect and update RuntimeState through a defined transition.

## Effect Emission

Command execution should produce explicit effects, for example:

* show message
* open choice
* set flag
* give item
* transfer player
* start battle
* play audio

Renderers consume effects; command semantics should remain renderer-agnostic.

## Guardrail

Do not add choices, flags, transfer, audio, or battle execution ad hoc before command sequencing and runtime state boundaries are designed.

## Failure Behavior

* unknown command types should report unsupported command
* malformed commands should not crash
* unsupported commands should not mutate runtime state
* sequence state should remain inspectable after failure
