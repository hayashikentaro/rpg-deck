# Architecture

RPG Deck is a declarative RPG authoring environment designed for AI-assisted workflows. The project is built around structured game data that humans and AI agents can inspect, validate, diff, and change safely.

RPG Deck is not an RPG Maker clone. It does not treat GUI state, a TypeScript runtime, or a specific engine runtime as the canonical project. The canonical project is declarative data owned by `packages/core-domain`.

## Design Philosophy

The central design choice is:

```text
Core Domain = source of truth
Web Runtime = prototype/runtime preview
Godot Runtime = future production candidate
Editor App = integration surface
UX Kit = reusable authoring UI components
```

The TypeScript runtime is valuable because it lets the project test map structure, movement, event semantics, battle experiments, save/load ideas, and editor preview quickly. It is not the final authority on game rules.

Godot support should remain possible by keeping the domain model declarative, serializable, and free of runtime-specific objects.

## Source of Truth

`packages/core-domain` owns the game production data:

* project model
* map definitions
* tileset definitions
* asset manifest
* event definitions
* event command schemas
* actors, enemies, items, and skills
* flags, switches, and variables
* save-state shapes
* validation
* diff generation
* event graph generation
* YAML and JSON serialization

React components, PixiJS objects, Canvas objects, DOM events, Godot nodes, and editor panel state must not be stored in domain models.

## Initial Layers

### `packages/core-domain`

The canonical data and domain model package. It should stay pure enough that web runtime, editor, exporter, CLI tools, tests, and future Godot adapters can share the same meaning.

Expected areas:

```text
schema/
model/
validation/
commands/
events/
diff/
graph/
serialize/
```

### `packages/web-runtime`

The browser-based prototype/runtime preview. It may execute `core-domain` data for fast iteration, but it must not define the canonical meaning of project data.

Expected areas:

```text
engine/
map/
character/
event-runner/
battle/
input/
render/
```

### `packages/godot-export`

The migration boundary for Godot. It converts `core-domain` data into Godot-readable output. The first target should be exported JSON read by a Godot C# runtime, not mass generation of `.tscn` scenes.

### `apps/editor`

The human-facing authoring app. It composes the domain package, runtime preview, Godot exporter, and UX components. It must not become the owner of domain logic or runtime-specific objects.

Game-specific screens belong under:

```text
apps/editor/src/features/
```

### `packages/ux-kit`

Reusable authoring UI components. The kit should make editor UX quality improvable in isolation and should not depend on RPG-specific domain concepts.

## AI-Generated Changes

AI-generated changes should be represented as reviewable diffs, not silent mutations.

The expected workflow is:

```text
proposed change
  -> affected entities
  -> validation issues
  -> before/after summary
  -> accept / reject / hold
```

This requires stable IDs, structured data, deterministic serialization, and validation that can run outside the editor UI.

## Dependency Rules

These rules are mandatory:

* `packages/core-domain` must not import React, DOM, PixiJS, Canvas, Godot, or editor code.
* `packages/ux-kit` must not import `core-domain`, `web-runtime`, or game-specific feature code.
* `packages/web-runtime` may import `core-domain` but must not import React or editor code.
* `packages/godot-export` may import `core-domain` but must not import editor or web-runtime code.
* `apps/editor` may compose all packages but must keep game-specific screens under `features/`.

Core boundary principles:

```text
ux-kit should not know RPG.
core-domain should not know UI.
web-runtime should not know Editor.
```

## Initial Repository Shape

```text
apps/
  editor/

packages/
  core-domain/
  web-runtime/
  ux-kit/
  godot-export/
  sample-projects/
    tiny-rpg/

docs/
```

## Runtime Alignment

Web and Godot runtimes should share concepts even if they are implemented in different languages.

Example TypeScript shape:

```ts
interface GameRuntime {
  loadProject(project: GameProject): Promise<void>;
  startNewGame(): Promise<void>;
  loadSave(save: SaveState): Promise<void>;
  dispatch(input: PlayerInput): void;
  tick(deltaMs: number): void;
  getSnapshot(): RuntimeSnapshot;
}
```

Godot C# can mirror the concepts without requiring exact API parity.

## Implementation Direction

Start with docs and boundaries, then build the smallest useful domain model and sample project. Runtime preview and editor UI should prove the data model instead of replacing it.
