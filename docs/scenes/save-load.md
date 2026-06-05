# Save / Load Scene

## Purpose

Save / Load Scene owns persistent progress selection and save/load confirmation.

## Responsibilities

* save slots
* serialize SaveData
* deserialize SaveData
* return to title or field

## Owns

* save slot selection
* save/load confirmation UI

## Reads

* `SaveData`
* ProjectData version
* runtime compatibility metadata

## Writes Through RuntimeActions

* save game
* load game
* return to title
* return to field

## Must Not Own

* ProjectData authoring
* editor persistence
* battle rules
* command semantics

## Related Packages

* `packages/runtime-core/src/save/`
* `packages/runtime-core/src/scene/`
* `packages/core-domain` SaveData types if kept there

## Related UI / Renderer

* web save/load screen
* Godot save/load scene
* title scene integration

## Implementation Phases

1. Define SaveData versioning and compatibility metadata.
2. Define save slot list/read/write actions.
3. Add load-to-runtime-state conversion.
4. Add title/field return behavior.

## AI Work Boundary

Save/load work should not edit ProjectData authoring, battle formulas, or command semantics. It may read runtime state boundaries and save data types.
