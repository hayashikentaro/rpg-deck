# Runtime State

## Purpose

This document defines target state boundaries for the classic RPG runtime.

## State Types

```text
ProjectData != SaveData != RuntimeState != EditorState
```

## ProjectData

ProjectData is the immutable game definition at runtime.

It includes:

* maps
* events
* commands
* actors
* items
* equipment
* enemies
* skills/spells
* shops/facilities
* assets
* validation metadata

Runtime should read ProjectData but not mutate it.

## SaveData

SaveData is persistent player progress.

It should eventually include:

* current map id
* player position
* facing
* party state
* HP/MP
* level/exp
* inventory
* equipment
* gold
* flags
* switches/variables
* opened chests
* defeated bosses
* playtime
* save slots

SaveData is not editor state and not ProjectData.

## RuntimeState

RuntimeState is the current in-memory execution state.

It should eventually include:

* current map id
* player position
* facing
* base scene mode
* overlay mode
* active event sequence
* command pointer
* pending message
* pending choice
* flags
* inventory
* party
* battle state, optional
* transition state, optional

RuntimeState may be derived from ProjectData plus SaveData when loading.

## EditorState

EditorState is editor-only UI state.

Examples:

* selected map
* selected event
* open inspector panel
* import textarea contents
* proposal review state
* preview focus state

EditorState is not saved as player progress.

## Mutation Rules

* ProjectData changes only through authoring/editor actions.
* SaveData changes through save/load and runtime progress.
* RuntimeState changes through runtime actions and command sequencing.
* EditorState changes through editor UI interactions.

Renderer-specific handles must not be stored in ProjectData or SaveData.
