# UX Kit

`packages/ux-kit` is the reusable authoring UI component package for RPG Deck.

It is where editor UX quality can be improved in isolation. It should not know RPG-specific concepts, and it should not depend on the editor app or the domain package.

Core rule:

    ux-kit should not know RPG.

## Responsibilities

`ux-kit` should provide reusable production-tool components such as:

* `AppShell`
* `SplitPane`
* `InspectorPanel`
* `PropertyGrid`
* `CommandList`
* `DiffCard`
* `EntityPicker`
* `ReferencePicker`
* `ValidationIssueList`
* `CanvasToolbar`
* `DialogueEditor` primitives

These components should be useful across map editing, event editing, database editing, preview panes, validation panels, and AI diff review.

## Dependency Rules

`packages/ux-kit`:

* does not depend on `apps/editor`
* does not depend on `packages/core-domain`
* does not depend on `packages/web-runtime`
* does not depend on game-specific feature code

RPG-specific components belong in:

    apps/editor/src/features/*

Generic UX components belong in:

    packages/ux-kit

## Component Boundary

Good `ux-kit` components:

* `InspectorPanel`
* `PropertyGrid`
* `CommandList`
* `DiffCard`
* `ReferencePicker`
* `ValidationIssueList`
* `SplitPane`
* `CanvasToolbar`

Feature-specific components that should not live in `ux-kit`:

* `RpgEventEditor`
* `TownMapPanel`
* `SlimeEnemyEditor`
* `ActorDatabaseScreen`

The editor can adapt domain concepts into generic props before passing them to `ux-kit`.

## Initial Component Notes

`InspectorPanel` should support sections, fields, validation messages, and inline diff indicators.

`PropertyGrid` should support text, number, select, boolean, position, asset, and reference-style fields through generic props.

`CommandList` should support command rows, nested command blocks, drag handles, add-command actions, disabled states, and validation markers without knowing RPG command semantics.

`DiffCard` should support summaries, before/after views, affected entities, risk markers, and accept/reject/hold actions.

`EntityPicker` and `ReferencePicker` should support search, recent selections, create-new flows, validation state, and jump-to-target actions.

`ValidationIssueList` should display structured issues from any source, not just RPG domain validation.

## Styling Direction

Expected future stack:

* shadcn/ui base
* Tailwind
* CVA or tailwind-variants
* variant-based state management

Avoid arbitrary class overuse. Components should expose clear variants and stable composition points instead of accumulating one-off styling in editor feature code.

## Component Review

Storybook or Ladle should be considered later for isolated component review.

Recommended first candidate:

    packages/ux-kit + Ladle

Reasons:

* lightweight component previews
* UX work without running the full editor
* easy for AI agents to add and update component stories
* room for future visual regression testing

Do not add Storybook, Ladle, React, Tailwind, or build tooling until the package setup phase explicitly calls for it.
