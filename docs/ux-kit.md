# UX Kit

`packages/ux-kit` should be independent from RPG-specific domain logic.

Its purpose is to make production-tool UX reusable, reviewable, and improvable outside `apps/editor`.

Core rule:

```text
ux-kit should not know RPG.
```

## Responsibilities

Suggested structure:

```text
packages/ux-kit/
  src/
    primitives/
    layout/
    inspector/
    property-grid/
    tree/
    command-list/
    diff/
    canvas-controls/
    picker/
    dialogue/
    token/
```

Reusable components should include:

* `InspectorPanel`
* `PropertyGrid`
* `TreeView`
* `CommandList`
* `TilePalette`
* `CanvasToolbar`
* `DiffCard`
* `ChoiceEditor`
* `DialogueEditor`
* `CommandPalette`
* `AssetPicker`
* `ReferencePicker`
* `ValidationIssueList`

## Component Boundary

Good `ux-kit` components:

* `PropertyGrid`
* `InspectorPanel`
* `DiffCard`
* `CommandList`
* `EntityPicker`
* `ValidationIssueList`
* `ResizablePane`
* `CanvasToolbar`

Bad `ux-kit` components:

* `RpgEventEditor`
* `TownMapPanel`
* `SlimeEnemyEditor`

RPG-specific components belong under `apps/editor/src/features/*`.

## Inspector

The inspector is the primary editing surface for selected entities.

Expected composition:

```text
InspectorPanel
  Section
  Field
  ReferencePicker
  ValidationMessage
  InlineDiff
```

It should be reusable for:

* maps
* NPCs
* treasure chests
* dialogue
* enemies
* items
* skills

## PropertyGrid

`PropertyGrid` is the foundation for stable editing UI.

Expected fields:

* `TextField`
* `NumberField`
* `SelectField`
* `BooleanField`
* `PositionField`
* `AssetField`
* `ReferenceField`

Well-defined field components also make AI-assisted UI generation safer: given a typed value, the agent can choose the matching field.

## CommandList

`CommandList` is the center of the event editor.

Expected parts:

* `CommandRow`
* `NestedCommandBlock`
* `DragHandle`
* `AddCommandButton`
* `DisableCommandToggle`
* `ValidationMarker`

Event command editing quality is one of the most important UX requirements for an RPG creation tool.

## DiffReview

AI-assisted editing needs first-class diff review components.

Expected parts:

* `DiffCard`
* `Summary`
* `BeforeAfter`
* `AffectedEntities`
* `RiskMarkers`
* `AcceptRejectHold`

The review states should include:

* accept
* reject
* hold

## EntityPicker and ReferencePicker

RPG projects have many references:

* `mapId`
* `eventId`
* `actorId`
* `enemyId`
* `itemId`
* `skillId`
* `flagId`
* `assetId`

Picker UX should support:

* search
* recent selections
* create new
* validation display
* jump to target

Weak reference selection will make the editor hard to use and easy to corrupt.

## Implementation Direction

Use a headless-ish approach with styled components.

Preferred choices:

* shadcn/ui base
* Tailwind
* CVA or tailwind-variants
* variant-based state management
* no arbitrary classes by default
* Storybook or Ladle for isolated component review
* visual regression structure that can be added later

Do not make the kit fully headless unless there is a concrete need. Fully headless components can slow down implementation. Do not make it app-specific either, because that blocks reuse.

## Component Workshop

`packages/ux-kit` should use Ladle or Storybook.

Recommended default:

```text
packages/ux-kit + Ladle
```

Reasons:

* lightweight
* focused on component review
* easy to ask agents to add stories
* allows UX work without booting the full editor
