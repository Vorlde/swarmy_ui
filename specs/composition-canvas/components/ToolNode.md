# ToolNode

Project: **swarmy_ui**. Dispatcher wrapper for tool cards on the canvas.

## Purpose

Receives a `ToolNodeData` and renders the correct card variant by `kind`: FunctionToolCard (`tool`, `provider`, `mcp`), PromptCard (`prompt`), AgentLockupCard (`subagent`, `handoff`). Also lazy-loads `ToolDetail` and exposes a `data-tool-column="<kind>"` container so measurement can compute per-kind edge anchors.

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

None (variant selection is by `data.kind`, not projection).

## API calls

| Endpoint | When |
|---|---|
| `GET /api/tools/{name}` | lazy on first render; cached per name; invalidated by `refreshEpoch` |

## Visual behavior

Renders the variant card inside a wrapper carrying `data-tool-column` (used when the node itself is a column member marker). While detail loads, the card shows with header info only and a shimmer body. Kind icon is shown in the card header by the variant.

## States

- **Loading**: shimmer body under the header.
- **Empty**: missing description/schemas renders header-only card.
- **Error**: detail fetch failure shows header plus a warning badge; layout uses fallback sizing.

## Theming

ToolNode adds no visuals of its own; all theming lives in the variant cards and `theme.node`. The kind-to-component map is injectable (`provide('toolCardMap', ...)`), so a theme can substitute entirely different card designs per tool kind without touching ToolNode logic.
