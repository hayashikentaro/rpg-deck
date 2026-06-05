# Field Scene

## Purpose

Field Scene owns overworld/dungeon movement and event discovery for classic RPG play.

## Responsibilities

* map rendering
* movement
* collision
* interact/touch detection
* encounter trigger
* transfer trigger
* event sequence start
* menu open request

## Owns

* field position view
* current map view
* field input handling
* movement intent

## Reads

* `ProjectData.maps`
* `SaveData.currentMapId`
* `SaveData.playerPosition`
* `SaveData.flags`
* `RuntimeState.overlayMode`

## Writes Through RuntimeActions

* move player
* face direction
* start event sequence
* request transfer
* request encounter
* open menu overlay

## Must Not Own

* battle damage
* menu item semantics
* save serialization
* ProjectData mutation

## Related Packages

* `packages/runtime-core/src/field/`
* `packages/runtime-core/src/event/`
* `packages/core-domain`

## Related UI / Renderer

* web field renderer
* Godot field scene
* debug grid during spike work

## Implementation Phases

1. Keep debug Field proof from Phase 11.
2. Extract field movement and event detection to renderer-agnostic runtime actions.
3. Add encounter and transfer requests.
4. Add production renderer after semantics are stable.

## AI Work Boundary

Field work should not require Battle, Menu, Shop, SaveLoad, or editor database context unless the prompt explicitly crosses that boundary.
