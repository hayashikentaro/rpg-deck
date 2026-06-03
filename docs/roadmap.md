# Roadmap

This roadmap starts RPG Deck as a declarative, AI-assisted RPG authoring environment. It intentionally begins with architecture, project data, and reviewability before runtime or editor implementation.

## Phase 0: Architecture Scaffold

Scope:

* monorepo directories
* `AGENTS.md`
* `README.md`
* docs

Target outcome:

* future agents understand the repository boundaries
* initial packages and app directories exist
* no runtime or package-manager setup is required yet

## Phase 1: Core Domain

Scope:

* schema
* validation
* project loader/writer
* sample `tiny-rpg`
* project summary
* event graph

Target outcome:

* `GameProject` and related definitions exist as typed data
* YAML/JSON loading and writing are possible
* invalid references are reported as structured validation issues
* event graph data can be produced for review and future Mermaid output

Initial implementation status:

* `packages/core-domain` has the first TypeScript model, Zod schema, validation, JSON/YAML parsing, project summary, and event graph builder.
* `packages/sample-projects/tiny-rpg/project.json` is the first valid sample project.
* `pnpm validate:sample` validates the sample and prints summary and graph data.
* Core hardening has started with coarse project diffing, Mermaid event graph output, stronger validation, and a `tiny-rpg` sample that includes transfer and battle edges.

## Phase 2: UX Kit Seed

Scope:

* `InspectorPanel`
* `PropertyGrid`
* `CommandList`
* `DiffCard`
* `ReferencePicker`
* `ValidationIssueList`

Target outcome:

* core authoring UI primitives exist outside the editor app
* generic components do not depend on RPG-specific domain logic
* editor features can compose reusable UI instead of inventing local panels

Initial implementation status:

* `packages/ux-kit` has started with generic React components for app shell layout, split panes, inspector panels, property grids, command lists, diff cards, reference pickers, validation issue lists, and canvas toolbars.

## Phase 3: Web Runtime Preview

Scope:

* map render
* player movement
* collision
* NPC display
* `show_message`
* `transfer_player`
* `set_flag`

Target outcome:

* `tiny-rpg` can be previewed in the browser
* runtime behavior consumes `core-domain` data
* early gameplay semantics can be tested quickly
* the web runtime remains a prototype, not the source of truth

Initial implementation status:

* `packages/web-runtime` has started with a headless runtime simulation for project loading, new game startup, grid movement, collision, interact/touch triggers, minimal command execution, event logs, and serializable snapshots.

## Phase 4: Editor App

Scope:

* map list
* map canvas
* event list
* inspector
* event command editor
* preview pane

Target outcome:

* a human can inspect and edit the project structure
* editor screens compose `core-domain`, `web-runtime`, and `ux-kit`
* domain logic does not move into editor feature code

Initial implementation status:

* `apps/editor` has started with a minimal Vite + React shell that loads `tiny-rpg`, shows summary, validation issues, Mermaid graph text, runtime snapshots, recent runtime logs, and sends button inputs to the headless runtime.

## Phase 5: AI Diff Review

Scope:

* proposed changes
* affected entities
* accept / reject / hold
* validation issues
* before/after summary

Target outcome:

* AI-generated project changes are reviewable before application
* reviewers can understand the impact of a change
* validation issues are surfaced during review
* accepted changes remain structured and serializable

Initial implementation status:

* `apps/editor` has started AI Diff Review with an editor-local mock project proposal, `core-domain` `ProjectDiff` generation, and `ux-kit` `DiffCard` actions for accept, reject, and hold.

## Phase 6: Godot Boundary Spike

Scope:

* export `tiny-rpg` data
* Godot C# runtime reads data
* player can walk on exported map

Target outcome:

* the Godot migration boundary is tested early
* exported asset IDs, map data, player start, and collision data are usable
* the spike proves the architecture without attempting a full port
