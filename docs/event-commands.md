# Event Commands

RPG Deck events are declarative `EventCommand` sequences.

The event system should be readable by humans, editable by AI agents, reviewable as diffs, validated by `core-domain`, and executable by both web and Godot runtimes with the same meaning.

## Why Declarative Commands

Declarative commands make it possible to:

* validate event structure before runtime
* generate reviewable AI diffs
* produce event graphs and Mermaid diagrams later
* keep behavior portable across TypeScript and Godot runtimes
* avoid hiding important game behavior inside editor or runtime code

## Initial Command Candidates

Initial commands:

* `show_message`
* `choice`
* `set_flag`
* `unset_flag`
* `if_flag`
* `give_item`
* `take_item`
* `start_battle`
* `transfer_player`
* `play_bgm`
* `play_sfx`

This list is intentionally small. Commands should be added when their data shape, validation, and runtime semantics are clear.

## No Arbitrary Scripts Initially

Arbitrary script code is prohibited in the initial project format.

Avoid event data like:

    script: |
      if player.level > 5:
        showMessage("...")

Free scripts make validation, AI review, event graph generation, and Godot migration harder. If scripting is added later, it should be a deliberate extension after declarative commands are stable.

## Nested Commands

Nested commands are allowed where the command schema explicitly supports them.

Examples:

* `choice` option branches
* `if_flag` true/false branches

Nested commands must remain serializable and schema-validated.

`choice.options` must contain at least one option. `if_flag.then` and `if_flag.else` may be empty arrays when a branch intentionally does nothing.

## NPC Conversation Example

    id: mayor_intro
    map: town
    position: [7, 6]
    sprite: mayor
    trigger: interact
    commands:
      - type: show_message
        speaker: mayor
        text: 北の洞窟には近づくな。
      - type: choice
        prompt: それでも行くか？
        options:
          - label: 行く
            commands:
              - type: set_flag
                flag: cave_warning_ignored
              - type: transfer_player
                map: cave_entrance
                position: [3, 10]
          - label: やめておく
            commands:
              - type: set_flag
                flag: cave_warning_seen
              - type: show_message
                speaker: mayor
                text: それが賢明だ。

## Runtime Portability

Web runtime and Godot runtime should execute the same command data with the same domain meaning.

Runtime-specific rendering or audio details belong in runtime adapters. The command payload should use stable IDs for maps, assets, flags, items, enemies, and other entities.

For example:

    - type: play_bgm
      bgm: town_theme

The command references `town_theme`. The runtime or exporter resolves that ID to an actual asset path.

## AI Review

`EventCommand` data should be easy for AI agents to generate and easy for humans to review.

Useful diff review metadata:

* affected event IDs
* affected map IDs
* added commands
* removed commands
* changed command payloads
* validation issues
* possible reference risks

## Event Graphs

The command model should support future event graph and Mermaid generation.

Useful graph edges include:

* map transfer targets
* battle targets
* flag branches
* choice branches
* referenced assets
* referenced items, enemies, actors, and skills
