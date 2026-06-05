# Project Schema Agent Guide

Project schema owns compatibility and migration, not runtime logic.

Rules:

* Do not introduce a Godot-specific schema fork.
* Do not mutate save data semantics.
* Keep Project JSON as source of truth.
* Do not implement runtime behavior here.
* Do not add parser or migration code until explicitly requested.
