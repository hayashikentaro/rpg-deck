# Runtime Core Skeleton

## Purpose

`runtime-core` is the future renderer-agnostic runtime state and scene/mode package for RPG Deck.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files.

## Owns

Future `runtime-core` should own:

* `RuntimeState`
* `SceneMode`
* `OverlayMode`
* `RuntimeAction`
* `RuntimeEffect`
* field movement/collision primitives
* event sequencing
* command runner boundary
* dialogue/menu/battle/shop/save-load state transitions at the core level

## May Depend On

Future code may depend on:

* `core-domain`
* project schema types if later needed

## Must Not Depend On

Future code must not depend on:

* React
* DOM
* Godot
* editor-model
* ux-kit
* renderer-specific UI

## Planned Structure

```text
src/
  scene/
  state/
  field/
  event/
  dialogue/
  menu/
  battle/
  shop/
  save-load/
```

## Non-Goals

This skeleton does not implement runtime behavior, command execution, renderer UI, package scripts, or workspace registration.

## Related Docs

* `docs/runtime/scene-mode.md`
* `docs/runtime/runtime-state.md`
* `docs/runtime/command-sequencing.md`
* `docs/architecture/dependency-boundaries.md`
* `docs/scenes/`
