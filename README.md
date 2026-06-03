# RPG Deck

Structured RPG authoring for humans and AI.

RPG Deck is a declarative RPG authoring environment designed for AI-assisted workflows. It starts from structured game data that both humans and AI agents can read, validate, review, and change safely.

RPG Deck is not an RPG Maker clone. It is not trying to reproduce RPG Maker's editor, runtime, file formats, or plugin ecosystem. The goal is a data-first 2D RPG production environment where the canonical game project is declarative, reviewable, and portable across runtimes.

## What RPG Deck Is

RPG Deck is:

* a structured authoring environment for 2D RPG projects
* a place where game data is the source of truth
* a project format that AI agents can inspect and modify without reverse-engineering GUI state
* a TypeScript-based prototype runtime for fast validation
* a future Godot-compatible production path
* an editor architecture with reusable UX components
* a workflow for reviewing AI-generated changes before accepting them

## What RPG Deck Is Not

RPG Deck is not:

* an RPG Maker clone
* a compatibility layer for existing RPG Maker projects
* a runtime-first game engine
* a GUI-only authoring tool
* a place to store domain truth inside React, PixiJS, Canvas, Godot nodes, or editor state
* a free-form scripting environment in its initial design

## Core Principles

* The source of truth is declarative data in `packages/core-domain`.
* AI and humans should work against the same structured project model.
* Event behavior is represented as declarative `EventCommand` data.
* AI-generated changes must be reviewable as diffs before they are accepted.
* The TypeScript runtime is a prototype/runtime preview, not the canonical runtime.
* Godot migration should stay possible through a clean export boundary.
* Runtime-specific objects must not enter domain models.
* UX components belong in `packages/ux-kit` so editor quality can be improved independently.
* Authoring changes should be confirmed in a playable preview loop as early as possible.

Early preview can be symbolic, HTML-grid based, and status-panel driven. It does not need final rendering, but it should come before richer editing surfaces or expanded AI diff review.

## Initial Architecture

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

The main dependency direction is:

```text
core-domain
  <- web-runtime
  <- godot-export
  <- apps/editor

ux-kit
  <- apps/editor
```

`apps/editor` composes packages. It should not become the owner of domain logic or runtime semantics.

## Package Responsibilities

`packages/core-domain` owns canonical project types, schemas, validation, references, diffs, event graph generation, and YAML/JSON serialization.

`packages/web-runtime` reads `core-domain` data and runs a browser-based prototype preview for maps, movement, events, battle experiments, and save/load experiments.

`packages/godot-export` converts `core-domain` data into Godot-readable output. The initial target is exported JSON read by a Godot C# runtime.

`packages/ux-kit` provides reusable production-tool UI components such as inspectors, property grids, command lists, diff cards, pickers, and validation issue panels. It should not know RPG-specific concepts.

`apps/editor` is the human-facing authoring app. It composes domain, runtime preview, export, and UX packages while keeping game-specific screens under `features/`.

`packages/sample-projects/tiny-rpg` is the first small project used to validate schemas, runtime preview, editor workflows, AI diff review, and Godot export boundaries.

## Initial Milestones

1. Architecture scaffold: directories, `AGENTS.md`, README, and docs.
2. Core Domain: schemas, validation, loader/writer, sample project, summary, and event graph.
3. UX Kit Seed: inspector, property grid, command list, diff card, reference picker, and validation list.
4. Web Runtime Preview: map render, player movement, collision, NPC display, `show_message`, `transfer_player`, and `set_flag`.
5. Editor App: map list, map canvas, event list, inspector, command editor, and preview pane.
6. Playable Grid Preview: HTML-grid preview, player/event/collision markers, message/choice/battle status, and runtime controls.
7. Event and Command Editing: minimal event inspector and command editing with immediate runtime confirmation.
8. Diff Review with Preview Confirmation: accept/reject/hold project changes only after their effects can be inspected in the editor and preview.
9. Map Editing and Renderer Improvements: HTML grid map editing first, then better preview rendering.
10. Godot Boundary Spike: export `tiny-rpg` or an edited sample and read it in a Godot C# runtime where the player can walk on exported map data.

## Documentation

* [Architecture](docs/architecture.md)
* [Project Format](docs/project-format.md)
* [Event Commands](docs/event-commands.md)
* [Godot Boundary](docs/godot-boundary.md)
* [UX Kit](docs/ux-kit.md)
* [Roadmap](docs/roadmap.md)
