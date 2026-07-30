# ToolNode

Project: **swarmy_ui**. Dispatcher wrapper for tool cards on the canvas.

## Purpose

Registered in the node-type registry under `kind: 'function'` - the only tool kind that gets its own
canvas node in the reference. It renders a FunctionToolCard, lazy-loads `ToolDetail`, and exposes a
`data-tool-column="<toolKind>"` container so measurement can compute per-kind edge anchors.

`prompt`, `handoff`, `provider` and `mcp` tool references do **not** become canvas nodes: they are
listed in the PROMPT card's right-hand rail. `subagent` references get their own registry entry
(`kind: 'subagent'` -> AgentLockupCard) plus a `CanvasGroup`. If a future capture shows `provider` or
`mcp` cards on canvas, add them as registry entries keyed by their own `kind`, not as a branch here.

## Props

```ts
interface Props {
  data: ToolNodeData;
  selected?: boolean;
  hovered?: boolean;
  refreshEpoch?: number;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | - | card click |
| `edit-surface` | `EditTarget` (`{ entityType: 'tool', entityId: data.name, defaultToolTab }`) | edit affordance of the inner card |

## Slots

None (card selection is by registry lookup, not projection).

## API calls

| Endpoint | When |
|---|---|
| `GET /api/tools/{name}` | lazy on first render; cached per name; invalidated by `refreshEpoch` |

## Visual behavior

Renders FunctionToolCard inside a wrapper carrying `data-canvas-node`, `data-canvas-node-id` and `data-tool-column` (used when the node itself is a column member marker). While detail loads, the card shows with header info only and a shimmer body. The kind icon (`TS` badge for a function tool) is shown in the card header by the card.

## States

- **Loading**: shimmer body under the header.
- **Empty**: missing description/schemas renders header-only card.
- **Error**: detail fetch failure shows header plus a warning badge; layout uses fallback sizing.

## Theming

ToolNode adds no visuals of its own; all theming lives in FunctionToolCard and `theme.node`. Substituting a different card design is a `nodeRegistry` entry swap (see `domain-model.md`), so nothing in ToolNode's logic needs touching.
