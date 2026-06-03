# Event Commands

Event behavior should be represented as declarative command data, not arbitrary script code.

This keeps event behavior portable across:

* web runtime
* Godot runtime
* editor validation
* AI diff review
* event graph analysis

## Command Data

Example:

```yaml
commands:
  - type: show_message
    speaker: mayor
    text: 北の洞窟には近づくな。
  - type: set_flag
    flag: cave_warning_seen
  - type: choice
    prompt: それでも行くか？
    options:
      - label: 行く
        commands:
          - type: transfer_player
            map: cave
            position: [3, 10]
```

The same command sequence should be executable in both web and Godot runtimes.

## Avoid Free Scripts

Avoid:

```yaml
script: |
  if player.level > 5:
    showMessage("...")
```

Free scripts hurt portability, validation, graph generation, diff review, and Godot migration. If scripting is added later, it should be added after the declarative command model is stable.

## Initial Command Set

The initial playable prototype should support:

* `show_message`
* `transfer_player`
* `set_flag`
* `choice`

Useful next commands:

* `set_switch`
* `set_variable`
* `give_item`
* `start_battle`
* `play_sound`
* `wait`
* `conditional_branch`

## Command Ownership

`core-domain` owns:

* command schemas
* command payload types
* validation
* reference checks
* graph generation
* diff-friendly serialization

`web-runtime` owns:

* executing commands in the browser prototype
* presenting dialogue
* applying command effects to runtime state
* mapping command behavior to rendering and input adapters

`godot-export` owns:

* exporting commands to Godot-readable data
* preserving stable command semantics
* adapting IDs and asset references for Godot runtime loading

`apps/editor` owns:

* command editing workflows
* command list UI composition
* validation display
* AI diff review for command changes

## Portability Rules

* Commands must be serializable data.
* Commands must use stable IDs for maps, assets, flags, switches, variables, and entities.
* Commands must not store runtime objects.
* Commands must not store editor component state.
* Nested commands must remain explicit and schema-validated.
* Runtime-specific behavior should be implemented in runtime adapters, not in command payloads.
