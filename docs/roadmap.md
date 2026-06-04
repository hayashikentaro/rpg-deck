# Roadmap

This roadmap starts RPG Deck as a declarative, AI-assisted RPG authoring environment. It intentionally begins with architecture, project data, and reviewability before runtime or editor implementation.

## Roadmap Principle: Editor-to-Playable Confirmation

Every implementation phase should connect editor-side authoring or inspection with playable or runtime-side confirmation.

Editing project data is not enough by itself. Each new authoring feature should answer:

* how does the user inspect or change it in the editor?
* how does the user confirm the resulting game behavior?

Validation and diff review should support this loop, not replace playable confirmation. Playable confirmation can start as an HTML grid, status panels, and runtime snapshots before any final renderer exists.

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

## Phase 5: Playable Grid Preview

Purpose:

* make the current project visually inspectable as a playable preview
* connect `core-domain` project data and `web-runtime` snapshots to a visible grid
* allow users to confirm game behavior without reading JSON snapshots

Scope:

* HTML/CSS grid preview, not Canvas/PixiJS
* current map display
* player marker
* event markers
* collision markers
* current runtime status
* message panel
* choice panel
* battle placeholder
* existing movement/interact controls connected to visible grid

Target confirmation:

* moving changes the visible player marker
* collision blocks movement visibly
* interact event shows message/choice UI
* touch event can show battle placeholder
* runtime snapshot and visual preview agree

Non-goals:

* tile images
* sprite images
* PixiJS
* Canvas rendering
* full map editor
* AI diff review

Initial implementation status:

* `apps/editor` now has a renderer-free HTML/CSS playable grid preview that displays the current map, player marker, event markers, collision markers, runtime status, message/choice panels, and battle placeholder from `core-domain` project data plus `web-runtime` snapshots.
* The player marker now shows facing direction so the one-tile-ahead interact target is easier to understand during playable confirmation.

## Phase 6: Minimal Event Inspector + Live Preview

Purpose:

* make event data inspectable/editable
* confirm edits immediately in playable preview

Scope:

* event list
* event inspector
* edit event position
* edit event trigger
* edit basic event label/sprite marker if useful
* edit first `show_message` text if present
* project validation refresh
* runtime restart/recreate from edited project

Target confirmation:

* moving an event changes its marker in the grid preview
* editing message text changes what appears when interacting
* changing trigger affects how the event is activated

Initial implementation status:

* `apps/editor` now has a minimal event list and inspector for editing event position, trigger, optional sprite ID, and the first direct `show_message` text. Project updates recreate the headless runtime so marker placement, trigger behavior, validation, graph output, and runtime messages can be confirmed against the playable preview.
* Runtime controls now use a compact D-pad layout and support Arrow keys, WASD, Space, Enter, and R for faster playable confirmation.

## Phase 7: Minimal Command Editing + Runtime Confirmation

Purpose:

* edit simple `EventCommand` sequences and confirm runtime behavior

Scope:

* command list viewer
* minimal editing for:
  * `show_message`
  * `set_flag`
  * `unset_flag`
  * `play_bgm`
  * `play_sfx`
  * `transfer_player`
  * `start_battle`
* validation refresh
* runtime confirmation

Target confirmation:

* adding/editing `show_message` changes message output
* adding `transfer_player` changes map/position during preview
* adding `start_battle` triggers battle placeholder
* flag commands affect later `if_flag` behavior where testable

Initial implementation status:

* The Event Inspector now shows the selected event's top-level command sequence and edits simple direct `show_message`, flag, audio, transfer, and battle command fields.
* Nested commands and unsupported command shapes remain intentionally read-only. Runtime confirmation continues through the Playable Grid Preview and manual controls.
* The runtime preview can now choose current `choice` options, executing their nested commands through existing runtime semantics while nested command editing remains intentionally out of scope.
* Runtime command execution now pauses on `show_message`; Continue or advance resumes pending commands before later choices or nested command results are shown.

## Phase 8: Mock Proposal / Diff Review + Preview Confirmation

Purpose:

* introduce structured proposal review only after visible preview exists
* accept/reject/hold project changes and confirm accepted changes in editor and preview

Scope:

* mock project proposal
* `diffProjects`
* `DiffCard`
* Accept / Reject / Hold
* accept updates current project
* validation and preview refresh after accept

Target confirmation:

* accepted dialogue changes appear in event inspector and runtime message panel
* accepted event additions appear in event list and grid preview
* rejected changes do not affect current project
* held changes remain visible as pending review state

Historical note:

* The editor already has an initial mock proposal and `DiffCard` surface. Future work should connect that review to visible preview confirmation before expanding the diff-review workflow.

Initial implementation status:

* The mock proposal now targets a preview-confirmable direct event dialogue change. Accept applies it to the current project for Event Inspector and Playable Preview confirmation, Reject leaves the project unchanged, and Hold keeps the proposal visible. Real AI integration remains out of scope.

## Phase 9: HTML Grid Map Editing + Runtime Confirmation

Purpose:

* begin map-level editing while staying in HTML grid

Scope:

* collision toggle
* event placement/move
* start position edit if small
* map bounds display
* validation refresh
* runtime confirmation

Target confirmation:

* adding collision blocks movement
* removing collision allows movement
* moving event changes interact/touch behavior location

Initial implementation status:

* A selected event can be moved by clicking an HTML grid cell. Event Inspector and Playable Preview reflect the updated position while collision editing, tile painting, start-position editing, drag and drop, and cross-map movement remain out of scope.
* The selected event is highlighted in the HTML grid so grid-click movement is easier to confirm.
* Clicking an event marker now selects that event, while clicking a non-event cell continues to move the selected event. Drag and drop, event creation or deletion, collision editing, tile painting, and cross-map movement remain out of scope.
* Map edit mode now separates event movement from collision toggling. Toggle collision mode updates the current map collision through project state, so runtime confirmation can show movement blocked or unblocked while tile painting, drag and drop, start-position editing, map creation or deletion, and cross-map movement remain out of scope.
* Map edit mode controls now have local styling so the active mode is visually clear without changing behavior.

## Phase 10: Better Preview Renderer

Purpose:

* improve visual clarity without changing source of truth

Scope:

* CSS tile colors
* marker styling
* simple viewport scaling
* optional asset-aware labels
* no heavy renderer unless explicitly chosen later

Initial implementation status:

* Playable Preview now includes a marker legend for player direction, event markers, collision, and empty cells. The renderer remains the existing HTML grid backed by project data and runtime snapshots; sprite rendering, tile artwork, Canvas, and renderer replacement remain out of scope.
* Authoring status now shows the current map edit mode, selected event, and grid click action near the preview. This improves authoring clarity without changing runtime or map-editing behavior, and the renderer remains HTML grid based.

## Phase 11: Godot Boundary Spike

Purpose:

* validate that edited project data and runtime semantics can cross into Godot

Scope:

* export `tiny-rpg` or edited sample to Godot-readable JSON
* Godot C# loader
* map/player/collision movement spike
* no full Godot game implementation
