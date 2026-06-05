# Godot Battle Scene Spike

## Purpose

The Godot Battle Scene Spike exists to test the tactile feel of classic RPG combat in Godot before a full renderer-agnostic battle implementation exists.

This is a playable-feel spike, not canonical battle architecture.

## Why This Spike Exists

Classic RPG feel depends on:

* field movement
* dialogue/event response
* battle loop rhythm

The Phase 11 Field spike proved field movement and dialogue/event response at debug depth. A small fixed-data battle spike is a reasonable next manual verification target because battle rhythm is hard to judge from architecture documents alone.

## Relationship to Phase 11 Closeout

The Phase 11 first Godot boundary spike remains accepted and closed. This Battle Spike is a new follow-up experiment.

It should not reopen or expand the Field boundary spike, and it should not imply that full battle runtime, command execution, or Project JSON battle integration exists.

## Scope

In scope:

* one hero
* one enemy
* fixed battle data
* fixed attack action
* enemy counterattack
* HP display
* message display
* victory
* defeat
* manual host verification

Out of scope:

* Project JSON schema changes
* enemy database
* actor database
* inventory
* items
* spells
* skills
* EXP
* gold
* drops
* encounter tables
* field connection
* save data
* runtime-core extraction in this first step
* audio
* animations

## Fixed Battle Data

Proposed fixed data:

```text
Hero:
  name: Hero
  hp: 30
  maxHp: 30
  attack: 8
  defense: 3

Slime:
  name: Slime
  hp: 16
  maxHp: 16
  attack: 5
  defense: 1
```

Recommended first damage model:

```text
damage = max(1, attack - defense)
```

Fixed damage is also acceptable for the first spike:

```text
heroDamage = 6
slimeDamage = 3
```

Use deterministic fixed or simple damage for the first spike.

## Minimal Playable Loop

1. Battle starts: `A Slime appears!`
2. Player confirms attack.
3. Hero attacks Slime.
4. Slime HP decreases.
5. If Slime HP reaches `0`, show victory message.
6. Otherwise Slime attacks Hero.
7. Hero HP decreases.
8. If Hero HP reaches `0`, show defeat message.
9. Otherwise wait for the next attack input.

## Input Model

Use existing confirm keys if possible:

* Enter
* Space
* Z

There is no battle menu in the first spike. Confirm key means `Attack`.

No cancel behavior is required.

## UI Model

Text-only debug UI is acceptable.

Display:

* enemy name and HP
* hero name and HP
* current message
* input hint

Example:

```text
Battle Spike
Slime HP: 16/16
Hero HP: 30/30
Message: A Slime appears!
Input: Enter / Space / Z = Attack
```

No sprites, animations, or audio are required.

## Battle State

Minimal state:

* phase:
  * `intro`
  * `awaiting_input`
  * `resolving`
  * `victory`
  * `defeat`
* hero HP
* enemy HP
* current message

Do not use SaveData yet. Do not mutate Project JSON.

## Damage Model

Use deterministic damage.

No randomness should be added for the first spike unless a later task explicitly chooses it.

Reasons:

* easier host verification
* easier Codex implementation
* easier future extraction to runtime-core tests

## Manual Verification Flow

Host command should remain:

```bash
pnpm godot
```

The implementation step may need a way to enter battle spike mode. Candidate entry options:

### Option A: Separate Scene / Script

Add a separate Godot scene/script for the battle spike and run it directly from the Godot editor later.

### Option B: Debug Key From Field Spike

Add a debug key from the existing Field spike to switch to the battle spike later.

### Option C: Host Script Mode Later

Add a host script mode later. Do not change package scripts or host scripts in this design task.

Recommended first implementation choice: Option A if the task can stay isolated from Field, otherwise Option B if a quick field-to-battle feel check is more valuable. Do not implement either option in this design task.

Manual verification should eventually confirm:

* battle UI appears
* initial message appears
* confirm input performs hero attack
* enemy HP decreases
* enemy counterattacks
* hero HP decreases
* victory occurs when Slime HP reaches `0`
* defeat can occur if Hero HP reaches `0`
* no Project JSON schema changes
* no field behavior regression

## Non-Goals

Do not implement in the first battle spike:

* full battle runtime
* Project JSON battle integration
* actor/enemy database usage
* encounter tables
* items, spells, skills, inventory, equipment, EXP, gold, drops
* save data mutation
* field-to-battle transition and return
* audio
* animation
* runtime-core extraction

## Guardrails

* Do not change Project JSON schema.
* Do not edit sample project data.
* Do not implement enemy database.
* Do not implement actor database.
* Do not implement inventory/items/spells.
* Do not implement battle rewards.
* Do not implement field-to-battle connection until entry/return state is designed.
* Do not modify package scripts unless a later task explicitly scopes it.
* Do not touch runtime-core implementation in this spike.
* Do not imply semantic parity with final battle runtime.

## Future Runtime-Core Extraction

After tactile validation, the battle loop should be extracted or reimplemented as renderer-agnostic runtime-core/runtime-systems work.

Future extraction targets:

* `packages/runtime-core/src/battle/`
* `packages/runtime-systems/src/battle/`

The first Godot spike may temporarily live in `godot_spike` as a fixed-data prototype. That does not make Godot the canonical battle runtime.

## Recommended Implementation Steps

1. Add separate `BattleSpike` script/class in `godot_spike/scripts/`.
2. Keep fixed data inside the class.
3. Add text-only battle HUD.
4. Add confirm input.
5. Implement deterministic attack/counterattack loop.
6. Add victory/defeat phase.
7. Host verify.
8. Document verification result.
9. Only then decide whether to connect Field or extract to runtime-core.

## Stop Conditions

Stop before implementation if:

* Project JSON schema changes seem necessary
* sample project data changes seem necessary
* SaveData or persistence seems necessary
* inventory, rewards, EXP, gold, audio, or animations become part of the task
* field-to-battle transition or return state is required without design
* package scripts or host scripts would need to change
* runtime-core implementation would need to be added during the fixed-data spike
