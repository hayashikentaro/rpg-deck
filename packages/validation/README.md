# Validation Skeleton

## Purpose

`validation` is the future package for diagnostics and integrity checks that can be shared by editor, runtime, and AI review workflows.

This directory is a skeleton boundary only. It is not yet registered as a workspace package, has no `package.json`, and contains no implementation files.

## Owns

Future validation should own checks for:

* missing map ids
* invalid positions
* invalid transfer targets
* missing asset references
* missing enemy/item/skill ids
* malformed command payloads
* invalid nested commands
* save compatibility
* project schema compatibility

## Must Not Own

Validation must not own:

* runtime behavior
* editor UI
* renderer behavior
* domain command execution

## Non-Goals

This skeleton does not move existing validation code, add diagnostics, create package scripts, or register a workspace package.

## Related Docs

* `docs/architecture/dependency-boundaries.md`
* `docs/runtime/runtime-state.md`
* `docs/runtime/command-sequencing.md`
