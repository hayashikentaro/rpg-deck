# Battle Scene

## Purpose

Battle Scene owns the distinct turn-based battle loop for classic RPG combat.

For tactile Godot experimentation before canonical runtime extraction, see the fixed-data [Godot Battle Scene Spike](../godot-battle-spike.md). That spike is a prototype path; this document remains the final scene-level battle architecture boundary.

## Responsibilities

* battle intro
* command selection
* target selection
* turn resolution
* battle messages
* rewards
* victory/defeat/escape

## Owns

* `BattleState`
* `BattlePhase`
* selected actor
* selected command
* selected target
* pending battle messages

## Reads

* `ProjectData.enemies`
* `ProjectData.skills`
* `ProjectData.items`
* `SaveData.party`
* `SaveData.inventory`

## Writes Through RuntimeActions

* HP/MP changes
* item consumption
* EXP/gold rewards
* battle result
* return to field

## Must Not Own

* ProjectData mutation
* map transfer rules
* editor state
* save serialization

## Related Packages

* `packages/runtime-core/src/battle/`
* `packages/runtime-systems/src/battle/`
* `packages/core-domain`

## Related UI / Renderer

* web battle screen
* Godot battle scene
* battle message overlay

## Implementation Phases

Battle phases:

* intro
* command_select
* target_select
* resolving_turn
* message
* victory
* defeat
* escape

Recommended path:

1. Define `BattleState` and phases.
2. Add deterministic turn resolution.
3. Add message/advance integration.
4. Add rewards and return-to-field behavior.

## AI Work Boundary

Battle work should not require Field rendering, Menu navigation, Shop, SaveLoad, or editor UI context except for explicit integration tasks.
