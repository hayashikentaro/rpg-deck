# Shop / Facility Scene

## Purpose

Shop / Facility Scene or Overlay owns transactional town services.

## Responsibilities

* buy/sell
* inn
* church
* save point
* confirmation dialogue
* result message

## Owns

* shop cursor
* buy/sell selection
* facility interaction state

## Reads

* `ProjectData.shops`
* `ProjectData.items`
* `SaveData.gold`
* `SaveData.inventory`
* `SaveData.party`

## Writes Through RuntimeActions

* buy item
* sell item
* spend gold
* restore party
* cure status
* request save

## Must Not Own

* item definitions
* save serialization
* battle rules

## Related Packages

* `packages/runtime-core/src/shop/`
* `packages/runtime-systems/src/inventory/`
* `packages/runtime-systems/src/facility/`

## Related UI / Renderer

* web shop overlay
* Godot shop/facility overlay
* dialogue overlay for confirmations

## Implementation Phases

1. Define shop/facility ProjectData shape.
2. Define transaction runtime actions.
3. Add buy/sell and gold mutation.
4. Add inn/church/save point facilities.

## AI Work Boundary

Shop/facility work should not own item definitions, battle formulas, or save file persistence.
