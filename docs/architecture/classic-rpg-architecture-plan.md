# Classic RPG Architecture Plan

## Purpose

This document is a memory aid and design map for RPG Deck's final classic Dragon Quest-like RPG target. It is not a request to implement every system immediately.

The goal is to keep scene ownership, runtime state, package boundaries, and AI work scope clear as the project grows.

## Current Proven Boundary

Phase 11 first Godot boundary spike proved the Field boundary at debug-spike depth:

* copied/exported RPG Deck Project JSON can be consumed by Godot
* current/start map, collision, event, player position, and player facing data cross the boundary
* debug movement, map bounds blocking, and collision blocking work
* `interact` and `touch` event detection work
* top-level command preview works without effects
* the first top-level `show_message` can be displayed in a debug message panel
* Project JSON remains source of truth; Godot does not save back and does not fork the schema

This is not the final RPG runtime. It proves enough to plan the full architecture.

## Final Game Structure

Target structure:

```text
GameRoot
  ProjectData
  SaveData
  RuntimeState
  SceneRouter
    FieldScene
    BattleScene
    MenuScene
    ShopFacilityScene
    SaveLoadScene
  OverlayRouter
    DialogueOverlay
    ChoiceOverlay
    TransitionOverlay
```

State boundary:

```text
ProjectData != SaveData != RuntimeState != EditorState
```

Definitions:

* `ProjectData`: immutable game definition: maps, events, commands, actors, items, enemies, shops, assets.
* `SaveData`: persistent player progress: map, position, party, inventory, flags, gold, defeated bosses, save slots.
* `RuntimeState`: current in-memory execution: scene mode, overlay mode, command pointer, pending message, battle state.
* `EditorState`: editor-only UI state: selected event, open panel, diff review state, preview input focus.

## Scene and Overlay Model

Base scenes own the main input/state loop. Overlays sit above a base scene and may pause or narrow input.

Base scenes:

* `Title`
* `Field`
* `Battle`
* `SaveLoad`

Overlays:

* `Dialogue`
* `Choice`
* `Menu`
* `Shop`
* `Transition`

Valid examples:

* `Field + Dialogue`
* `Field + Menu`
* `Field + Shop`
* `Battle + Dialogue`
* `Field + Transition`

Battle is a base scene because it owns turn phases, command selection, target selection, and battle outcome handling.

## Runtime State Model

Runtime state should be plain serializable data where possible. Runtime-specific objects such as Godot nodes, DOM elements, React components, or audio handles must not be stored in domain models.

Runtime state eventually includes:

* current map id
* player grid position
* facing
* base scene mode
* overlay mode
* active event sequence
* command pointer
* pending message
* pending choice
* flags
* inventory
* party
* battle state
* transition state

## Scene Responsibilities

Scene documents define ownership in detail:

* [Field](../scenes/field.md)
* [Dialogue](../scenes/dialogue.md)
* [Menu](../scenes/menu.md)
* [Battle](../scenes/battle.md)
* [Shop / Facility](../scenes/shop-facility.md)
* [Save / Load](../scenes/save-load.md)

Each scene should own its input interpretation and local view state, but durable mutations should go through runtime actions.

## Package Architecture

Target TypeScript package structure:

```text
packages/
  core-domain/
  project-schema/
  event-commands/
  runtime-core/
  runtime-systems/
  editor-model/
  validation/
  sample-projects/
  ux-kit/
```

Responsibilities:

* `core-domain`: canonical declarative RPG data types and stable IDs.
* `project-schema`: parser/writer and compatibility layer if schema complexity outgrows `core-domain`.
* `event-commands`: command type definitions and command metadata if separated later.
* `runtime-core`: renderer-agnostic scene modes, runtime state, runtime actions, command sequencing.
* `runtime-systems`: reusable systems such as battle formulas, inventory, encounters, shops, and growth.
* `editor-model`: editor-only derived state and authoring workflows.
* `validation`: project and save compatibility validation if separated later.
* `sample-projects`: focused canonical examples for tests and manual QA.
* `ux-kit`: generic UI primitives with no RPG-specific knowledge.

See [dependency boundaries](./dependency-boundaries.md) for allowed dependency direction.

## Godot Runtime Architecture

If the Godot spike graduates into a runtime, prefer a split structure:

```text
godot_runtime/
  scenes/
    title/
    field/
    battle/
    menu/
    dialogue/
    shop/
    save_load/
  scripts/
    app/
    data/
    field/
    event/
    ui/
    menu/
    battle/
    shop/
    audio/
    debug/
```

The current `godot_spike/ProjectLoader.cs` is intentionally monolithic for the first boundary spike. A future runtime should split rendering, input, event sequencing, UI overlays, battle, menu, audio, and debug concerns.

Godot must not introduce a Project JSON schema fork and must not save back to Project JSON.

## Web Runtime Architecture

Future web runtime shape:

```text
apps/web-runtime/
  src/
    runtime/
    renderer/
    input/
    ui/
      message-window/
      menu/
      battle/
      shop/
    debug/
```

The web runtime should consume `runtime-core` state and effects. It should not duplicate command, battle, inventory, or save semantics separately from `runtime-core` / `runtime-systems`.

## Editor / Database Architecture

Classic RPG support needs database-style editors, similar in spirit to RPG Maker:

```text
apps/editor/src/features/
  project/
  map-editor/
  event-editor/
  command-editor/
  database-editor/
    actors/
    items/
    equipment/
    enemies/
    skills/
    encounters/
    shops/
    facilities/
  asset-editor/
  validation-panel/
  export-panel/
```

Database entities eventually include:

* actors
* classes/jobs, if supported
* items
* equipment
* enemies
* troops/enemy groups
* skills/spells
* shops
* facilities
* encounters
* flags and variables

The editor authors `ProjectData`. It does not own runtime command semantics, battle damage rules, or save data semantics.

## Save Data Boundary

Save data is persistent player progress. It should be serializable, versioned, and compatible with a specific project id/schema version.

Save data is not Project JSON. It should never mutate map definitions, event definitions, item definitions, enemy definitions, or command definitions.

## Command Sequencing Boundary

Command sequencing needs an explicit design before additional command effects are implemented. See [command sequencing](../runtime/command-sequencing.md).

Do not add choices, flags, transfer, audio, battle, inventory, or nested command execution ad hoc before the command pointer, pause/resume, and runtime state boundaries are defined.

## Battle Architecture

Battle should be a base scene with its own `BattleState` and phases:

* intro
* command select
* target select
* resolving turn
* message
* victory
* defeat
* escape

Battle formulas and rewards belong in runtime systems, not in editor UI or renderer code.

## Menu Architecture

Menu should be an overlay or base mode depending on context. It should own cursor/panel navigation, but mutations such as item use, equipment changes, and save requests should go through runtime actions.

Menu must not own battle turn rules, field movement, or ProjectData mutation.

## Validation and Sample Projects

Future sample projects should be feature-focused:

```text
packages/sample-projects/
  tiny-rpg/
  event-basics/
  transfer-test/
  dialogue-choice/
  flags-test/
  inventory-test/
  battle-minimal/
  shop-inn-test/
```

Validation should cover project data integrity, save compatibility, command references, asset references, encounters, shops, and battle data as those systems are introduced.

## Recommended Implementation Phases

Recommended order:

1. Freeze Phase 11 first spike as accepted.
2. Design command sequencing and runtime state transitions.
3. Extract renderer-agnostic runtime state/actions before adding more Godot command effects.
4. Add dialogue sequencing and advance input.
5. Add choice UI and nested command sequencing.
6. Add flags/inventory only after state ownership is explicit.
7. Add transfer/map switching with scene transition rules.
8. Add battle as a base scene.
9. Add menu, shop/facility, and save/load boundaries.
10. Add asset/audio resolution after stable asset mapping exists.

## Non-Goals / Guardrails

This plan does not mean these systems exist today.

Guardrails:

* no full RPG runtime is implied
* no full command execution is implied
* no dialogue UI is implied by the debug message panel
* no choices, flags, transfer, battle/audio, save/load, or shops are implied
* no Godot Project JSON authoring
* no save-back
* no schema fork
* no scene should own unrelated scene state
* no renderer should own domain semantics

## Open Questions

* Should save data types live in `core-domain`, `runtime-core`, or a separate package?
* Should command metadata stay in `core-domain` or split into `event-commands`?
* How should Godot compare runtime semantics against `runtime-core` without importing TypeScript?
* Which sample project should become the canonical battle smoke test?
* Should shops and facilities be overlays on Field or separate base scenes?
* What is the minimum automated Godot verification strategy?
