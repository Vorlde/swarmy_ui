# AgentNode

Project: **swarmy_ui**. Root node card for the agent being composed. Registered in the node-type registry under `kind: 'agent'`.

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

Flat white card, 1px `#171717` border, rounded corners, **no shadow**. Two bands:

**Header band**, split by a vertical hairline:
- Left: eyebrow `[icon] AGENT` (`text-[10px]` uppercase tracking-wider muted) followed by a
  `rounded-full` type pill reading the agent type in caps (`AI + HUMAN`). Below it the agent avatar,
  the display name in semibold, and the machine name beneath in muted mono.
- Right: a `(x) VARIABLES` column (`data-variables-section`) listing declared variables, or the muted
  word `None`.

**Sides band**, one column per side separated by a vertical hairline. Each column has a coloured
eyebrow (`SUPPORT` sky `#00a6f4`, `HUMAN` amber `#fe9a00`), the prompt name in mono (human sides read
`No prompt`), then a label/value list: `Stop on response`, `Stop tool`, `Max steps`,
`End conversation tool`. Values are right-aligned; truthy values are tinted with the side accent,
`Off` / `-` stay muted.

Selected surface is `#efe3ff` light / `#302043` dark; hover `#f8f2ff` / `#1c1525`.

## States

- **Loading**: not applicable (data is inline); when `refreshing` an inline spinner replaces the icon.
- **Empty**: no variables shows `None`; a human side shows `No prompt` and no config rows.
- **Error**: none.

## Measurement anchors

`data-variables-section` on the variables column. No model anchor, no tool columns.

## Theming

All chrome from `theme.node`: `borderRadius`, `borderColor` (`#171717` for the root card), `background`, `elevation` (`'none'` - canvas cards never use `box-shadow`), `headerTextColor`, `mutedTextColor`; side eyebrow colours from `theme.node.sideAccent`. A square-corners/flat theme or a compact-dense theme only changes tokens; the DOM structure and emitted events are unchanged.
