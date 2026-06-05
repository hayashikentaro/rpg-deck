# Validation Agent Guide

Validation emits diagnostics, not runtime behavior.

Rules:

* Do not mutate ProjectData.
* Do not implement command execution.
* Do not import React, Godot, or DOM.
* Keep diagnostics stable and useful for editor, runtime, and AI review.
* Prefer clear issue codes, paths, and messages when diagnostics are added later.
