# Architecture

This project treats TypeScript runtime code as a prototyping runtime, not as the final source of truth.

The source of truth is:

```text
Core Domain = declarative game data and domain model
Web Runtime = design probe / prototyping runtime
Godot Runtime = production candidate
```

The TypeScript runtime is useful for rapidly validating event semantics, battle logic, map structure, UX, and AI-assisted diff review. Stable concepts should move into `core-domain` first, then be consumed by web and Godot runtimes.

## Layer Boundaries

The repository is split into five primary layers:

1. `packages/core-domain`
2. `packages/web-runtime`
3. `packages/godot-export`
4. `apps/editor`
5. `packages/ux-kit`

## `packages/core-domain`

`core-domain` owns the canonical game production data.

Suggested structure:

```text
packages/core-domain/
  src/
    schema/
    model/
    validation/
    commands/
    events/
    diff/
    graph/
    serialize/
```

Responsibilities:

* `GameProject`
* `MapDefinition`
* `EventDefinition`
* `BattleDefinition`
* `DialogueDefinition`
* `Flag`, `Switch`, and `Variable` definitions
* Zod schemas
* validation
* project diffing
* event graph generation
* reference integrity checks
* YAML and JSON serialization

Allowed examples:

* `GameProject`
* `MapDefinition`
* `EventCommand`
* `validateProject()`
* `diffProject()`
* `exportEventGraph()`

Forbidden examples:

* React components
* Pixi sprites
* Canvas rendering
* Godot nodes
* DOM events

Keeping this package clean is the main requirement for a practical Godot migration path.

## `packages/web-runtime`

`web-runtime` is a TypeScript prototype runtime.

Suggested structure:

```text
packages/web-runtime/
  src/
    engine/
    map/
    character/
    event-runner/
    battle/
    input/
    render/
```

Responsibilities:

* tile rendering
* player movement
* collision
* event execution
* dialogue display
* battle preview
* save/load prototyping

This package reads `core-domain` data. It must not become the canonical place for game semantics.

Event command meaning should be defined by `core-domain`; `web-runtime` only executes those commands.

## `packages/godot-export`

`godot-export` is the boundary for Godot migration.

Suggested structure:

```text
packages/godot-export/
  src/
    export-project.ts
    export-maps.ts
    export-events.ts
    export-database.ts
    godot-manifest.ts
```

Responsibilities:

* transform `core-domain` data for Godot
* manage output strategy for `.tscn`, `.tres`, `.json`, `.res`, or related formats
* format data for a Godot runtime
* convert asset paths
* map stable IDs to Godot node names where needed

The first export target should be simple:

```text
core-domain project
  -> godot-export
  -> godot-project/game_data/*.json
```

Godot C# runtime should initially read exported JSON. Generating many Godot scenes too early adds complexity before the runtime boundary is understood.

## `apps/editor`

`apps/editor` is the human-facing production environment.

Suggested structure:

```text
apps/editor/
  src/
    app/
    features/
      map-editor/
      event-editor/
      database-editor/
      preview/
      diff-review/
    panels/
    routes/
```

Responsibilities:

* open project files
* edit maps
* edit events
* edit database entries
* preview the game
* review AI-generated diffs

The editor is an application composition layer. Generic UI quality should live in `packages/ux-kit`, not inside editor feature code.

## `packages/ux-kit`

`ux-kit` owns reusable production-tool UX components.

Suggested structure:

```text
packages/ux-kit/
  src/
    primitives/
    layout/
    inspector/
    property-grid/
    tree/
    command-list/
    diff/
    canvas-controls/
    picker/
    dialogue/
    token/
```

Good component examples:

* `PropertyGrid`
* `InspectorPanel`
* `DiffCard`
* `CommandList`
* `EntityPicker`
* `ValidationIssueList`
* `ResizablePane`
* `CanvasToolbar`

Bad component examples:

* `RpgEventEditor`
* `TownMapPanel`
* `SlimeEnemyEditor`

RPG-specific components belong under `apps/editor/src/features/*`. Generic UX components belong in `packages/ux-kit`.

## Recommended Monorepo Shape

```text
rpg-loom/
  apps/
    editor/
      src/
        features/
          map-editor/
          event-editor/
          database-editor/
          preview/
          diff-review/
        app/
        main.tsx

  packages/
    core-domain/
      src/
        schema/
        model/
        validation/
        diff/
        graph/
        serialize/

    web-runtime/
      src/
        engine/
        render/
        input/
        event-runner/
        battle/

    ux-kit/
      src/
        primitives/
        inspector/
        property-grid/
        tree/
        command-list/
        diff/
        picker/
        dialogue/
        canvas-controls/

    godot-export/
      src/
        export-project.ts
        export-maps.ts
        export-events.ts

    sample-projects/
      tiny-rpg/
        game.yaml
        maps/
        events/
        actors/
        enemies/

  docs/
    architecture.md
    project-format.md
    event-commands.md
    godot-boundary.md
    ux-kit.md
```

## Dependency Rules

Forbidden dependencies:

* `core-domain` depends on runtime, UI, editor, or Godot code.
* `ux-kit` depends on `core-domain`, `web-runtime`, or game-specific feature code.
* `web-runtime` depends on React or editor code.
* `godot-export` depends on editor or web-runtime code.
* `editor` becomes the owner of core semantics instead of acting as an integration layer.

Boundary principles:

```text
ux-kit should not know RPG.
core-domain should not know UI.
web-runtime should not know Editor.
```

## Runtime Shape

Web and Godot runtimes should share concepts, even if the implementations are in different languages.

TypeScript target:

```ts
interface GameRuntime {
  loadProject(project: GameProject): Promise<void>;
  startNewGame(): Promise<void>;
  loadSave(save: SaveState): Promise<void>;
  dispatch(input: PlayerInput): void;
  tick(deltaMs: number): void;
  getSnapshot(): RuntimeSnapshot;
}

class WebRuntime implements GameRuntime {}
```

Godot C# target:

```csharp
public interface IGameRuntime
{
    Task LoadProject(GameProject project);
    Task StartNewGame();
    void Dispatch(PlayerInput input);
    void Tick(double deltaMs);
    RuntimeSnapshot GetSnapshot();
}
```

The APIs do not need to match exactly. The concepts should match.

## Runtime Internals

Keep this conceptual split even if the first implementation is not physically split:

```text
runtime-core
runtime-renderer-web
runtime-input-web
```

Event execution, movement, and battle calculations should be pure-ish. Rendering, audio, and input should be adapters. This makes future Godot translation easier.

## Development Phases

### Phase 0: Architecture scaffold

Create the monorepo boundaries:

* `apps/editor`
* `packages/core-domain`
* `packages/web-runtime`
* `packages/ux-kit`
* `packages/godot-export`
* `packages/sample-projects`

The first goal is to lock dependency direction.

### Phase 1: Core Domain

Define the game data format:

* `GameProject`
* `MapDefinition`
* `EventDefinition`
* `EventCommand`
* `ActorDefinition`
* `EnemyDefinition`
* `ItemDefinition`
* `AssetManifest`
* `ValidationIssue`
* `ProjectDiff`

Initial validation can be CLI-based:

```bash
rpg validate examples/tiny-rpg
rpg summarize examples/tiny-rpg
rpg graph events town
```

### Phase 2: UX Kit seed

Create reusable editor UX foundations:

* `AppShell`
* `SplitPane`
* `InspectorPanel`
* `PropertyGrid`
* `CommandList`
* `DiffCard`
* `ReferencePicker`
* `ValidationIssueList`

### Phase 3: Web Runtime Preview

Make `tiny-rpg` playable in the web runtime:

* map rendering
* player movement
* collision
* event trigger
* `show_message`
* `transfer_player`
* `set_flag`

### Phase 4: Editor App

Use `ux-kit` to build the production UI:

* map list
* map canvas
* event list
* inspector
* event command editor
* preview pane

### Phase 5: Godot Boundary Spike

Read `tiny-rpg` map, player, and collision data in Godot C#:

```text
core-domain JSON
  -> godot-export
  -> Godot C# runtime
  -> playable movement
```

This spike should happen early to prevent TypeScript-specific assumptions from leaking into the domain model.

## Initial Implementation Order

1. monorepo scaffold
2. `docs/architecture.md`
3. `docs/godot-boundary.md`
4. `packages/core-domain` types and schemas
5. `packages/ux-kit` base components
6. `tiny-rpg` sample
7. web-runtime preview
8. editor app
9. Godot boundary spike
