# Godot Spike Data Input

Put copied RPG Deck Project JSON here as:

    project.json

`project.json` may exist locally for host-side Godot verification. It is ignored by git and should not be committed.

Do not treat this directory as canonical source data. The canonical project remains RPG Deck Project JSON owned by `packages/core-domain` and edited through the RPG Deck editor.

Regenerate `project.json` from `packages/sample-projects/tiny-rpg/project.json` or copy it from the RPG Deck editor's Project JSON section. Generated or copied project JSON fixtures should not be committed unless a later task explicitly allows a fixture strategy.

Before handing JSON to Godot, use the RPG Deck editor's `Preview Project JSON` or import flow to confirm the JSON parses and to inspect validation issue count.
