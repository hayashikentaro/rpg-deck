# AI Work Boundaries

## Purpose

This document defines how Codex / AI work should stay scoped as RPG Deck grows into a classic RPG toolchain.

The goal is to let Codex work on one scene or system without reading or modifying unrelated scenes or systems.

## Why AI Work Boundaries Matter

AI work becomes expensive and error-prone when responsibilities are mixed. Common causes:

* giant files
* mixed UI/runtime/domain responsibilities
* scene code directly mutating `ProjectData`
* runtime semantics duplicated in editor UI
* unclear generated vs canonical files
* Field work requiring Battle or Menu context
* command semantics spread across unrelated packages

## Core Rule

Codex should be able to work on one scene/system without reading or modifying unrelated scenes/systems.

If a task requires reading the whole repo, the boundaries are probably too weak or the prompt is too broad.

## Scene-Scoped Work

Scene-scoped tasks should name the scene and the allowed ownership boundary.

Examples:

* Field movement work should not require Battle or Menu context.
* Dialogue work should not change battle damage formulas.
* Battle target selection should not edit Project JSON schema.
* Shop UI should not implement save serialization.

## Runtime-Scoped Work

Runtime-scoped tasks should name the state and action boundary:

* scene mode
* overlay mode
* runtime actions
* command sequence
* battle state
* inventory state
* save data

Runtime changes should avoid editor UI unless the task explicitly includes editor confirmation.

## Package-Scoped Work

Package-scoped work should respect dependency direction:

* `core-domain` owns declarative data, not UI or renderer behavior.
* `runtime-core` owns runtime state/actions, not React or Godot nodes.
* `runtime-systems` owns reusable RPG rules, not editor panels.
* `apps/editor` owns authoring UI, not runtime semantics.
* `ux-kit` owns generic UI primitives, not RPG rules.

## What Codex Should Read

Field movement work should read:

* `packages/runtime-core/src/field/`
* `docs/scenes/field.md`
* relevant sample project

Battle work should read:

* `packages/runtime-core/src/battle/`
* `packages/runtime-systems/src/battle/`
* `docs/scenes/battle.md`
* `packages/sample-projects/battle-minimal/`

Menu work should read:

* `packages/runtime-core/src/menu/`
* `packages/runtime-systems/src/inventory/`
* `docs/scenes/menu.md`

Command sequencing work should read:

* `packages/runtime-core/src/event/`
* `packages/core-domain` command types
* `docs/runtime/command-sequencing.md`

Editor database work should read:

* relevant `apps/editor/src/features/database-editor/` area
* `packages/core-domain` entity types
* relevant validation docs/tests

## What Codex Should Not Read

Unless the prompt explicitly says so, Codex should not read or modify:

* unrelated scene directories
* generated files
* local handoff JSON
* Godot cache files
* editor UI while doing runtime semantics
* runtime systems while doing pure docs
* package scripts while changing scene behavior

## Prompt Patterns

Good prompt shape:

```text
Task: implement Field movement bounds.
Read: docs/scenes/field.md, runtime-core field files, sample project.
Allowed files: field runtime files and focused tests.
Do not edit: battle, menu, editor, schema.
Verification: focused tests.
```

Bad prompt shape:

```text
Make RPG gameplay better.
```

Prompts should name:

* scene/system
* allowed files
* files to inspect first
* non-goals
* verification

## Directory-Level AGENTS.md Strategy

Future directory-level `AGENTS.md` files should summarize local boundaries without duplicating the root file.

Recommended future files:

* `packages/core-domain/AGENTS.md`
* `packages/runtime-core/AGENTS.md`
* `packages/runtime-systems/AGENTS.md`
* `apps/editor/AGENTS.md`
* `apps/web-runtime/AGENTS.md`
* `godot_spike/AGENTS.md`
* `docs/AGENTS.md`

Do not create these files until a task explicitly asks for them.

## Stop Conditions

Stop and ask before proceeding when:

* a task requires files outside the allowed list
* implementation appears to require a schema change
* a scene task requires unrelated scene context
* generated files would need to be committed
* local handoff data would need to become canonical
* runtime semantics would need to move into editor UI
* package dependency direction would be inverted

## Examples

Field task:

* read `docs/scenes/field.md`
* modify field runtime only
* do not edit battle/menu/shop

Battle task:

* read `docs/scenes/battle.md`
* modify battle state/actions/systems only
* do not edit field collision

Command sequencing task:

* read `docs/runtime/command-sequencing.md`
* modify event runtime state/actions only
* do not add choice UI until sequencing says how focus and nested commands work
