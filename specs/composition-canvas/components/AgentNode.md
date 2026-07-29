# AgentNode

Project: **swarmy_ui**. Root node card for the agent being composed.

## Purpose

Renders the top-level `AgentData` as the canvas root: name, type, side labels, and declared variables. Source of the structural edges to sides and hooks.

## Props

```ts
interface Props {
  data: AgentData;
  selected?: boolean;
  hovered?: boolean;
  refreshing?: boolean;
  refreshEpoch?: number;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | - | card click |
| `edit-surface` | `EditTarget` (`{ entityType: 'agent', entityId: data.name, section }`) | edit button or a section click |

## Slots

None.

## API calls

None (data comes fully resolved from the layout generator).

## Visual behavior

Card: icon (or fallback glyph) + machine name in semibold, subtitle line `TYPE - N sides`, a row `A: <sideALabel>  B: <sideBLabel>`, and a VariablesList of required variables. Selected state draws a ring in `theme.node.selectedRingColor`. Hover raises the shadow.

## States

- **Loading**: not applicable (data is inline); when `refreshing` an inline spinner replaces the icon.
- **Empty**: single-side agents (`ai_human`) omit the B side label; no variables hides the variables row.
- **Error**: none.

## Measurement anchors

None (no model anchor, no tool columns).

## Theming

All chrome from `theme.node`: `borderRadius`, `borderColor`, `background`, `shadow`, `headerTextColor`, `mutedTextColor`. A square-corners/flat theme or a compact-dense theme only changes tokens; the DOM structure and emitted events are unchanged.
