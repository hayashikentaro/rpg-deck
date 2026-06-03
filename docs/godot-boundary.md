# Godot Boundary

Godot migration depends on keeping `core-domain` clean and declarative.

The TypeScript runtime is a design probe. Godot is a production candidate. Neither should become the canonical source of game data.

## Ownership

### Belongs to `core-domain`

* project model
* map definitions
* event definitions
* event command schemas
* asset IDs
* grid coordinates
* validation
* diffing
* event graph generation
* YAML and JSON serialization

### Belongs to `web-runtime`

* browser rendering
* browser input
* prototype map movement
* prototype collision
* prototype event execution
* dialogue preview
* battle preview
* save/load experiments

### Belongs to Godot runtime

* Godot scene tree usage
* Godot rendering
* Godot input mapping
* Godot physics integration
* C# runtime state
* loading exported data
* translating domain concepts into nodes/resources

### Belongs to `godot-export`

* export format
* Godot-friendly JSON output
* optional future `.tscn`, `.tres`, `.res`, or resource generation
* asset path conversion
* stable ID to Godot node-name mapping

## Initial Export Format

Start with JSON export:

```text
core-domain project
  -> godot-export
  -> godot-project/game_data/*.json
```

Godot C# runtime should read this JSON.

Avoid generating many Godot scenes at first. Scene generation should wait until the runtime data boundary is proven.

## Asset ID Rules

Core data should reference assets by stable IDs.

Avoid:

```yaml
sprite: assets/sprites/mayor.png
```

Prefer:

```yaml
sprite: mayor
```

Asset manifest:

```yaml
assets:
  sprites:
    mayor:
      path: assets/sprites/characters/mayor.png
      frameSize: [16, 16]
```

`godot-export` can convert this to Godot paths such as `res://...`.

## Coordinate Rules

Core coordinate convention:

```text
grid position = [x, y]
x = right
y = down
tileSize = project setting
```

Runtime conversion:

```text
worldX = gridX * tileSize
worldY = gridY * tileSize
```

Godot should follow the same domain convention and perform runtime-specific conversion at the boundary.

## EventCommand Portability

Events must be command data, not runtime scripts.

Portable example:

```yaml
commands:
  - type: show_message
    speaker: mayor
    text: 北の洞窟には近づくな。
  - type: set_flag
    flag: cave_warning_seen
```

Avoid:

```yaml
script: |
  if player.level > 5:
    showMessage("...")
```

Declarative commands allow:

* web execution
* Godot execution
* editor validation
* graph generation
* AI diff review
* safer migration

## Runtime API Alignment

Web runtime target:

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

The signatures do not need to be identical. The concepts should stay aligned.

## Boundary Spike

Run an early Godot spike before the TypeScript implementation grows too large.

Target:

```text
tiny-rpg map + player + collision in Godot C#
```

Flow:

```text
core-domain JSON
  -> godot-export
  -> Godot C# runtime
  -> player can walk
```

This validates that the domain model is not accidentally tied to browser or TypeScript runtime assumptions.

## Intentional Non-Goals For Now

Avoid these early:

* generating large numbers of Godot scenes
* embedding PixiJS, Canvas, DOM, or React concepts into `core-domain`
* storing Godot nodes or resources in domain models
* arbitrary event scripts
* runtime-specific asset paths in core data
* making the web runtime the canonical semantics owner
