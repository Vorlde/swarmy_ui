# PromptCard

Project: **swarmy_ui**. The PROMPT card body. Rendered by SidePromptNode for `kind: 'prompt'` nodes; it is not a separate canvas node type. Prompt-*tools* do not get their own canvas card - they are listed in this card's `SUB-PROMPTS` rail.

## Purpose

Displays a `PromptData` plus the four rail lists: name, description, the inline model chip, the Tool/Context/Reasoning config groups, Input schema, Variables, and the Functions / Sub-prompts / Handoffs / Sub-agents rail. Exposes the model anchor for dashed model edges.

## Props

```ts
interface Props {
  prompt: PromptData;
  compact?: boolean;        // tool-node variant: header + model row only
  selected?: boolean;
  hovered?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `edit` | `section?: 'body' \| 'schema' \| 'variables'` | section click / edit button |

## Slots

| Slot | Purpose |
|---|---|
| `header-actions` | extra buttons in the header row (e.g. side node edit affordance) |
| `footer` | extra rows (tool summary, max turns) |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/providers/{provider}/icon?model={model}` | when `modelProvider` is set; cached per session |

## Visual behavior

See `SidePromptNode.md` -> Visual behavior for the full three-band anatomy. Summary: eyebrow
`[chat icon] PROMPT` + side pill; edit icon button; the **model chip** (`data-model-anchor`) - a bordered
rounded chip with provider icon, model name, upstream id in muted mono, hairline, and a 2x2 grid of
capability dots; prompt name in bold mono with description; then the config columns, the Input schema /
Variables column, and the four-section right rail. Compact mode hides the config columns and the rail.
Max turns badge shown when `maxTurns` is set.

## States

- **Loading**: provider icon shimmer inside the model chip.
- **Empty**: empty sections render the muted word `None` rather than hiding.
- **Error**: icon fallback glyph.

## Measurement anchors

`data-model-anchor` on the header model chip; `data-variables-section` on the Variables block;
`data-tool-column="<kind>"` on each rail section.

## Theming

Card chrome from `theme.node` with `elevation: 'none'` (no `box-shadow`) and the border colour taken from `theme.node.sideAccent`. The model chip's background and border use a dedicated `prompt.modelChipBackground` theme token so a theme can restyle it (filled chip vs flat row) without structural changes. Rail eyebrow hues (functions blue, sub-prompts fuchsia, handoffs sky, sub-agents emerald) are a `prompt.railColors` token map.
