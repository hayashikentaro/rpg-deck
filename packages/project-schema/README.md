# Project Schema Skeleton

## Purpose

`project-schema` is a future compatibility layer for RPG Deck Project JSON when schema complexity outgrows `core-domain`.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files. It may remain a skeleton until schema complexity requires it.

## Owns

Future `project-schema` may own:

* schema version
* parse
* serialize
* migrate
* import/export
* Godot handoff JSON shaping

## Must Not Own

Project schema must not own:

* runtime behavior
* editor UI
* renderer behavior
* save data progression semantics

## Guardrails

Project JSON remains source of truth. Do not introduce a Godot-specific schema fork.

## Non-Goals

This skeleton does not move existing parser code, add migrations, create package scripts, or register a workspace package.

## Related Docs

* `docs/godot-boundary.md`
* `docs/architecture/dependency-boundaries.md`
* `docs/architecture/classic-rpg-architecture-plan.md`
