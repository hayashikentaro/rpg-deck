# Runtime Systems Skeleton

## Purpose

`runtime-systems` is the future package for reusable RPG rules that can be called by `runtime-core`.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files.

## Owns

Future `runtime-systems` should own:

* battle formulas
* turn order
* enemy AI
* inventory operations
* item effects
* equipment rules
* party stat/growth rules
* encounter rolls
* shop/facility operations

## May Depend On

Future code may depend on:

* `core-domain`
* `runtime-core`

## Must Not Own

This package must not own:

* renderer state
* editor UI
* ProjectData mutation
* save serialization UI
* scene routing

## Planned Structure

```text
src/
  battle/
  inventory/
  party/
  encounter/
  shop/
  facilities/
```

## Non-Goals

This skeleton does not implement RPG rules, command execution, renderer UI, package scripts, or workspace registration.

## Related Docs

* `docs/architecture/dependency-boundaries.md`
* `docs/scenes/battle.md`
* `docs/scenes/menu.md`
* `docs/scenes/shop-facility.md`
