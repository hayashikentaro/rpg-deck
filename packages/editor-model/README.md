# Editor Model Skeleton

## Purpose

`editor-model` is the future package for editor-only derived state and authoring workflows.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files.

## Owns

Future `editor-model` may own:

* selection
* undo/redo
* clipboard
* map editing state
* event editing state
* command editing state
* database editing state
* project tree state

## Must Not Own

Editor model must not own:

* runtime command semantics
* battle damage rules
* save data semantics
* Godot runtime behavior

## Non-Goals

This skeleton does not move editor code, implement undo/redo, add package scripts, or register a workspace package.

## Related Docs

* `docs/architecture/ai-work-boundaries.md`
* `docs/architecture/dependency-boundaries.md`
* `docs/runtime/runtime-state.md`
