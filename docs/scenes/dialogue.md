# Dialogue Scene / Overlay

## Purpose

Dialogue Overlay owns message presentation and user-facing event text flow.

## Responsibilities

* message window
* text display
* advance input
* choice UI later
* pause/resume event sequencing

## Owns

* pending displayed message view
* choice selection view
* dialogue input focus

## Reads

* `RuntimeState.pendingMessage`
* `RuntimeState.pendingChoice`
* active command sequence state

## Writes Through RuntimeActions

* advance message
* choose option
* close dialogue overlay

## Must Not Own

* command semantics
* flag mutation rules
* battle rules
* ProjectData mutation

## Related Packages

* `packages/runtime-core/src/event/`
* `packages/runtime-core/src/dialogue/`
* `packages/core-domain` command types

## Related UI / Renderer

* web message window
* Godot dialogue overlay
* current Godot debug message panel

## Implementation Phases

1. Keep Godot debug message panel as proof only.
2. Design command sequencing and advance input.
3. Add message advance.
4. Add choice UI after nested command sequencing is explicit.

## AI Work Boundary

Dialogue work should not implement flags, transfer, battle, or audio unless command sequencing explicitly includes those effects.
