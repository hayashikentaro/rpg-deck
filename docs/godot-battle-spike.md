# Godot Battle Scene Spike

## Purpose

The Godot Battle Scene Spike is a fixed-data / playable-feel / non-canonical prototype for testing classic Dragon Quest-like battle feel in Godot.

It exists to validate:

* message pacing
* input wait
* HP display updates
* attack/counterattack rhythm
* victory/defeat flow

This spike is not a canonical runtime implementation. It must not define final battle architecture, Project JSON schema, SaveData, or runtime-core semantics.

## Scope

In scope:

* one hero
* one slime
* fixed stats
* fixed deterministic damage
* Attack only
* enemy counterattack
* HP display
* battle messages
* victory condition
* defeat condition
* manual verification

Out of scope:

* Project JSON schema changes
* SaveData
* RuntimeState persistence
* EditorState
* field-to-battle transition
* enemy database
* actor database
* items
* spells
* skills
* EXP
* gold
* equipment
* random encounters
* audio
* animation polish
* runtime-core extraction
* runtime-systems extraction

## Fixed Battle Data

Use simple fixed data.

Hero:

* name: `Hero`
* HP: `30 / 30`
* attack label only, or fixed attack damage
* receives fixed slime damage

Slime:

* name: `Slime`
* HP: `16 / 16`
* receives fixed hero damage
* counterattacks while alive

Recommended fixed damage:

* Hero deals `6` damage to Slime.
* Slime deals `3` damage to Hero.

Fixed damage is preferred for this spike because the goal is feel and flow, not formula correctness.

## Input

Allowed inputs:

* Enter
* Space
* Z

All should advance the battle when input is expected.

No menu navigation is required yet. The only action is Attack.

## Battle Loop

The spike should follow this exact loop:

```text
A Slime appears!
wait for input
Hero attacks!
Slime takes 6 damage.
if Slime HP <= 0:
  Slime is defeated!
  Victory!
  battle ends
else:
  Slime attacks!
  Hero takes 3 damage.
  if Hero HP <= 0:
    Hero is defeated...
    Defeat.
    battle ends
  else:
    wait for next input
```

Message pacing may be implemented with explicit input waits or simple staged messages. Keep the loop easy to inspect during host manual verification.

## Godot Implementation Boundary

The future implementation should stay inside `godot_spike/` as much as possible.

It may add Godot scene/script files needed for the spike.

It must not:

* modify TypeScript runtime packages
* modify Project JSON schema
* treat Godot battle state as canonical SaveData
* introduce general-purpose battle abstractions prematurely
* make Godot the canonical runtime architecture

Godot remains non-authoritative:

* it may read exported Project JSON
* it must not define or fork canonical schema
* it must not write ProjectData
* it must not write SaveData

## Suggested Future Files

Possible implementation files:

* `godot_spike/BattleSpike.cs`
* `godot_spike/BattleSpikeState.cs`
* `godot_spike/BattleSpike.tscn`

These names are suggestions only. Use names and locations that follow existing Godot spike conventions if those conventions point somewhere better.

Do not add these files during this documentation task.

## Manual Verification Checklist

After a future implementation, manually confirm:

* Battle scene starts with `A Slime appears!`
* HP is visible for Hero and Slime.
* Enter advances the battle.
* Space advances the battle.
* Z advances the battle.
* Hero attack reduces Slime HP.
* Slime counterattack reduces Hero HP.
* Slime defeat shows victory message.
* Hero defeat shows defeat message.
* Battle does not write SaveData.
* Battle does not require Project JSON schema changes.
* Existing TypeScript checks still pass if applicable.
* Existing Godot spike can still run if applicable.

## Closeout Notes

After implementation and host verification, record:

* what felt good
* what felt awkward
* whether message pacing should be input-driven or timed
* whether HP display belongs in scene UI or shared runtime view model later
* what should eventually move to runtime-core
* what should eventually move to runtime-systems
* what should remain Godot presentation-only

## Future Extraction Notes

After the spike is validated, a later phase may introduce renderer-agnostic battle architecture.

Future `runtime-core` concepts may include:

* `BattleState`
* `BattlePhase`
* `BattleAction`
* `BattleEvent` or `BattleEffect`
* turn progression

Future `runtime-systems` concepts may include:

* damage formula
* enemy AI
* item effects
* skill effects
* reward calculation

None of this should be implemented during the Battle Spike documentation task.
