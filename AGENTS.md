# AGENTS.md

Guidance for Codex and other AI agents working in this repository.

## Repository Boundary

Before making changes, confirm you are in the correct local checkout:

```bash
pwd
git remote -v
git status --short --branch
```

Do not edit files outside this repository unless the user explicitly asks.

If the repository remote or working directory does not match the user's request, stop and report the mismatch before editing.

## Current Project State

Before making a change, inspect the relevant project files instead of assuming the structure.

Prefer reading these first when available:

```text
README.md
AGENTS.md
package.json
docs/
```

Use existing project conventions, scripts, and directory structure. Do not introduce replacement tooling or new architecture unless the task requires it.

## Working Guidelines

* Keep changes scoped to the user's request.
* Prefer small, reviewable commits.
* Preserve user changes already present in the working tree.
* If unexpected changes or untracked files exist, report them instead of modifying or deleting them.
* Prefer existing project conventions over introducing new structure.
* Avoid broad refactors unless they are required for the task.
* Add or update tests when changing behavior once a test setup exists.
* Document important setup, API, or workflow changes in the repository rather than only in chat.
* Do not silently change API names, routes, persisted metadata shapes, public interfaces, or domain semantics.
* When changing API routes, response shapes, persisted metadata, or shared types, update related docs and consumers together.
* When removing a feature or supported path, remove or clearly deprecate related handlers, config fields, types, docs, and examples so dead code is not mistaken for supported behavior.

## Standard Task Workflow

For every implementation task in this repository, follow this workflow unless the user explicitly says otherwise.

### Before editing

* Confirm the current repository with `pwd`.
* Confirm the remote with `git remote -v`.
* Check the working tree with `git status --short --branch`.
* Preserve existing user changes.
* If unexpected changes or untracked files exist, report them instead of modifying or deleting them.
* Inspect the files directly relevant to the requested change.
* If the task depends on local environment state, permissions, running processes, installed tools, or git state, verify with non-destructive commands instead of assuming.

### While editing

* Keep changes scoped to the requested task.
* Prefer small, reviewable changes.
* Avoid broad refactors unless they are required for the task.
* Follow existing project conventions.
* Update related docs, types, tests, and examples together when behavior or interfaces change.
* Do not duplicate repository-wide guidance already present in this file; update the existing relevant section instead.

### After editing

Run the standard verification commands appropriate for the change.

At minimum, run:

```bash
git diff --check
```

Run project-specific checks when applicable, such as:

```bash
npm run build
npm test
```

If server-side JavaScript files changed and the project uses plain Node files, run syntax checks where appropriate, for example:

```bash
node --check path/to/file.js
```

If a check cannot be run, report why.

### When finished

* Commit the relevant changes.
* Push the commit.
* Report:

  * what changed
  * verification results
  * commit hash
  * push status
  * skipped checks
  * unexpected files not touched

## Prompt Handoff Convention

Agents working in this repository should read and follow this `AGENTS.md` before making changes.

Task-specific prompts should focus on:

* the requested change
* relevant context
* non-goals
* acceptance criteria
* task-specific verification

Repository-wide workflow rules are defined in this file and should not be repeated in every prompt.

If a task-specific user instruction conflicts with this file, stop and report the conflict unless the user's instruction clearly and safely overrides a non-safety process preference.

## Runtime and Generated Files

Generated files, local runtime state, logs, caches, and temporary files should not be committed unless explicitly requested.

Do not delete untracked files unless the task explicitly asks for cleanup and the file is clearly generated.

If unexpected untracked files exist, report them rather than modifying or deleting them.

## Commit and Push Rule

Whenever repository files are modified, commit the relevant changes and push them to the current branch.

* Do not force push.
* If push fails, report the reason and leave the local commit intact.
* Do not rewrite history unless the user explicitly asks and the risk is understood.

## Development Workflow

Inspect `package.json` or the repository's documented tooling before introducing new scripts.

Prefer existing scripts and repository tooling. Do not invent replacement tooling if project scripts already exist.

Common verification commands may include:

```bash
git diff --check
npm run build
npm test
```

For documentation-only changes, `git diff --check` is required. Build/test commands are useful when quick, but may be skipped if unrelated and reported as skipped.

## Architecture Rules

* `packages/core-domain` must not import React, DOM, PixiJS, Canvas, Godot, or editor code.
* `packages/ux-kit` must not import `core-domain`, `web-runtime`, or game-specific feature code.
* `packages/web-runtime` may import `core-domain` but must not import React or editor code.
* `packages/godot-export` may import `core-domain` but must not import editor or web-runtime code.
* `apps/editor` may compose all packages but must keep game-specific screens under `features/`.
* Event behavior must be represented as declarative `EventCommand` data, not arbitrary script code.
* Asset references in `core-domain` must use stable asset IDs, not runtime-specific paths.
* Runtime-specific objects must never be stored in `core-domain` models.

Core boundary principles:

```text
ux-kit should not know RPG.
core-domain should not know UI.
web-runtime should not know Editor.
```
