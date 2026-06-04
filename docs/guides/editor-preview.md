# Editor Preview Guide

## Purpose

RPG Deck should not build editor features in isolation. Authoring or inspection features should connect to playable or runtime-side confirmation as early as possible.

## When to Read

Read this guide when changing:

* `apps/editor`
* playable preview
* runtime controls in the editor
* event, map, or command editing flows
* mock or AI proposal review that affects project state
* validation or diff-review surfaces meant to support authoring decisions

## Core Principle

* A feature is not sufficient merely because it edits project data.
* The user should be able to confirm the resulting game behavior or preview state.
* Validation and diff review support the loop; they do not replace playable confirmation.
* Early confirmation can be symbolic, such as an HTML grid preview, status panels, runtime snapshot, event log, or message, choice, and battle placeholders.

## Boundary Rules

* `packages/core-domain` remains the source of truth for project data and validation.
* `packages/web-runtime` remains responsible for movement, collision, event trigger, and command semantics.
* `apps/editor` may compose packages and render preview UI, but must not reimplement runtime semantics.
* Preview components render project data plus runtime snapshots and should not own behavior semantics.
* `packages/ux-kit` must remain RPG-agnostic.

## Implementation Order Preference

1. Playable or runtime confirmation layer
2. Minimal authoring or inspection
3. Live preview confirmation
4. Validation and graph feedback
5. Diff or proposal review
6. Richer rendering or export work

## Scope Discipline

* If a task is about one phase, do not opportunistically implement adjacent phases.
* If a task says not to implement AI diff review, map editing, renderer work, or Godot export, report those as follow-ups instead of implementing them.
* If `Allowed files to modify` is provided, respect it as a hard boundary.
