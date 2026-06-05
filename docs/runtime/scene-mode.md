# Scene Mode

## Purpose

This document defines the target scene/mode model for classic RPG runtime work.

## Base Scene Modes

```text
BaseSceneMode
  Title
  Field
  Battle
  SaveLoad
```

Base scene modes own the main input loop and state transition loop for the current game context.

## Overlay Modes

```text
OverlayMode
  None
  Dialogue
  Choice
  Menu
  Shop
  Transition
```

Overlays sit above a base scene and may pause, narrow, or redirect input.

## Valid Combinations

Common combinations:

* `Field + None`
* `Field + Dialogue`
* `Field + Choice`
* `Field + Menu`
* `Field + Shop`
* `Field + Transition`
* `Battle + Dialogue`
* `Battle + Choice`
* `Battle + Transition`

Dialogue, Menu, and Shop often overlay Field. Battle is a base scene because it owns a distinct input/state loop.

## Transition Rule

Scene transitions should be explicit `RuntimeEffects` or runtime actions, not ad hoc UI jumps.

Examples:

* `requestBattle(enemyId)`
* `startTransfer(mapId, position)`
* `openMenu()`
* `openDialogue(message)`
* `completeTransition()`

## Guardrails

* Field must not directly construct Battle UI.
* Battle must not directly mutate ProjectData.
* Dialogue must not own command semantics.
* Menu must not own save serialization.
* Scene mode changes must be visible in RuntimeState.
