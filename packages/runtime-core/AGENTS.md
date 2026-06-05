# Runtime Core Agent Guide

Runtime core owns renderer-agnostic state transitions.

Rules:

* Do not import React, DOM, Godot, editor UI, or ux-kit.
* Prefer pure functions and deterministic state transitions.
* Treat ProjectData as read-only at runtime.
* Change RuntimeState through RuntimeActions.
* Do not implement renderer UI here.
* Do not add command effects before reading `docs/runtime/command-sequencing.md`.
* For field work, read `docs/scenes/field.md`.
* For battle work, read `docs/scenes/battle.md`.
* For menu work, read `docs/scenes/menu.md`.
