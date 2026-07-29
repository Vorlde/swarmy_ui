# SidePromptNode

Project: **swarmy_ui**. Node for one side (A or B) of an agent: an AI prompt participant or a human receiver.

## Purpose

Renders `SideNode.data`. In `ai` mode it is a PromptCard variant with side chrome and a model anchor row; in `human` mode it renders a simple person card. It is the source of both tool-column structural edges and the dashed model edge.

## Props

```ts
interface Props {
  data: SideNode['data'];   // { id, mode, label, prompt?, tools?, variables? }
  selected?: boolean;
  hovered?: boolean;
  hoveredEditTarget?: unknown;
  refreshEpoch?: number;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | - | card click |
| `edit-surface` | `EditTarget` (`{ entityType: 'prompt', entityId: prompt.name, section }`) | edit button or section click (body/schema/variables) |
| `hover-edit-target` | `string \| null` | hovering a sub-section that maps to an edit target |

## Slots

None.

## API calls

| Endpoint | When |
|---|---|
| `GET /api/providers/{provider}/icon?model={model}` | AI mode, when the prompt pins a model |
| (prompt body via parent) | prompt data arrives resolved from CompositionView |

## Visual behavior

AI mode card: header `A  Risk Analyst` + edit button; line `prompt: risk_analyst`; a model anchor row (`data-model-anchor`) with `model: default` + provider icon; variables row; tool summary `tools: 2 fn - 1 prompt - 1 mcp`. Human mode: person icon, label, muted line "waits for user input"; no model anchor, no tool columns.

## States

- **Loading**: provider icon shimmer (AI mode).
- **Empty**: no variables/tools hides those rows; human mode has no optional rows.
- **Error**: icon failure falls back to generic glyph.

## Measurement anchors

- `data-model-anchor` on the model row (vertical center is the model edge origin).
- `data-tool-column="<kind>"` on each per-kind tool summary segment when tools are expanded inline.

## Theming

Side tint (sky for A, amber for B) comes from `theme.edge.colors.sideA/sideB` reused as a header accent token. Human-mode vs AI-mode layout difference is data-driven, not theme-driven. Card chrome from `theme.node`; a theme can move the side accent (left border, top bar, tinted background) by overriding side-accent slot tokens.
