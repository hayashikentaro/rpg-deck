# Event Commands Skeleton

## Purpose

`event-commands` is a future home for command registry and metadata if command definitions outgrow `core-domain`.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files.

## Owns

Future `event-commands` may own:

* command type registry
* command payload metadata
* command preview metadata
* command validation metadata
* editor form metadata

## Must Not Own

Event commands must not own:

* command execution runtime
* renderer UI
* battle formulas
* save serialization

Actual sequencing and execution belong in `runtime-core` / `runtime-systems`.

## Non-Goals

This skeleton does not move command types, add execution behavior, create package scripts, or register a workspace package.

## Related Docs

* `docs/runtime/command-sequencing.md`
* `docs/godot-command-boundary.md`
* `docs/architecture/dependency-boundaries.md`
