# Menu Scene / Overlay

## Purpose

Menu Overlay owns player-facing command menus outside battle.

## Responsibilities

* main command menu
* item menu
* spell/skill menu
* equipment menu
* status menu
* party menu
* settings
* save entry

## Owns

* menu cursor state
* active menu panel
* local menu navigation

## Reads

* `SaveData.party`
* `SaveData.inventory`
* `SaveData.equipment`
* `SaveData.gold`
* `ProjectData.items`
* `ProjectData.skills`

## Writes Through RuntimeActions

* use item
* equip item
* open save
* close menu

## Must Not Own

* battle turn rules
* field movement
* ProjectData mutation

## Related Packages

* `packages/runtime-core/src/menu/`
* `packages/runtime-systems/src/inventory/`
* `packages/runtime-systems/src/equipment/`

## Related UI / Renderer

* web menu overlay
* Godot menu scene/overlay

## Implementation Phases

1. Define menu state and cursor actions.
2. Display party/inventory/status from SaveData.
3. Add item/equipment actions through runtime systems.
4. Route save entry to SaveLoad.

## AI Work Boundary

Menu work should not edit battle formulas, field collision, ProjectData schema, or save serialization unless explicitly authorized.
