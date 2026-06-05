# Dependency Boundaries

## Purpose

This document records the intended package dependency direction for the final classic RPG architecture.

## Dependency Direction

Allowed high-level direction:

```text
core-domain
  <- project-schema
  <- validation
  <- runtime-core
  <- runtime-systems
  <- apps/web-runtime
  <- apps/editor
```

Dependencies should point toward more stable, renderer-agnostic data and rules. UI and renderer packages should not be imported by domain packages.

## Core Domain

`core-domain` owns canonical declarative data:

* Project
* Map
* Event
* EventCommand
* Actor
* Party
* Item
* Equipment
* Enemy
* EncounterTable
* Skill/Spell
* Shop
* Facility
* Flag/Variable
* SaveData types if kept there

`core-domain` must not import:

* React
* DOM
* Godot
* editor code
* renderer code
* runtime-specific objects

## Runtime Core

`runtime-core` may depend on:

* `core-domain`
* project-schema types if needed

`runtime-core` owns:

* scene mode
* overlay mode
* runtime state
* runtime actions
* command sequencing
* deterministic state transitions

`runtime-core` must not depend on:

* React
* Godot
* DOM
* editor-model
* ux-kit

## Runtime Systems

`runtime-systems` may depend on:

* `core-domain`
* `runtime-core`

It owns reusable RPG rules:

* battle formulas
* inventory operations
* equipment rules
* encounter selection
* shop/facility operations
* actor growth rules

It must not own renderer state or editor UI.

## Editor App

`apps/editor` may depend on:

* `core-domain`
* project-schema
* validation
* editor-model
* ux-kit

`apps/editor` must not own:

* runtime command semantics
* battle damage rules
* save data semantics
* Godot-specific runtime behavior

Editor features author ProjectData and preview runtime results; they should not become the canonical runtime engine.

## Web Runtime and Godot Runtime

`apps/web-runtime` and future `godot_runtime` should render runtime state/effects and route input into runtime actions.

They should avoid inventing divergent semantics. If behavior differs from `runtime-core`, it should be explicit, tested, and documented.

Renderer runtimes may own:

* input binding
* visual rendering
* audio node lifecycle
* platform/window setup
* debug overlays

Renderer runtimes must not own:

* Project JSON schema
* domain command definitions
* save data meaning
* battle math semantics
* editor authoring state

## UX Kit

`ux-kit` owns generic UI primitives only.

It must not import:

* core-domain
* web-runtime
* runtime-core
* game-specific feature code

## Boundary Checks

When adding code, ask:

* Is this data definition, runtime state, runtime rule, renderer behavior, or editor UI?
* Does the dependency point toward the stable data/rule layer?
* Would this force Field work to read Battle or Menu code?
* Would this make Codex read unrelated packages for a scoped task?
