# Editor Model Agent Guide

Editor model owns authoring state, not gameplay semantics.

Rules:

* Do not implement battle damage or command execution here.
* Use validation diagnostics for project correctness.
* Keep EditorState separate from ProjectData, RuntimeState, and SaveData.
* Do not import Godot runtime code.
* Do not make editor UI state authoritative for runtime behavior.
