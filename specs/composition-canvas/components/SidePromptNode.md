# SidePromptNode

Project: **swarmy_ui**. Node for one side (A or B) of an agent: an AI prompt participant or a human receiver. Registered in the node-type registry under **two** kinds: `prompt` and `human`.

## Purpose

Renders a `PromptNode` (the big PROMPT card) or a `HumanNode` (the one-line Human card). It is the source of both tool-column structural edges and the dashed model edge.

## Props

```ts
interface Props {
  data: PromptNode['data'] | HumanNode['data'];
  kind: 'prompt' | 'human';   // supplied by the registry dispatch
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

**`prompt` card.** Flat white, 1px border in the side accent (sky `#00a6f4` for side A, amber `#fe9a00`
for side B), rounded, no shadow. Three bands:

1. *Header* - eyebrow `[chat icon] PROMPT` plus a `rounded-full` side pill (`SUPPORT` / `WORKER` /
   `REVIEWER`) in the side accent; on the right an edit icon button and the **model chip**
   (`data-model-anchor`): a bordered rounded chip with the provider icon, model display name, the
   upstream model id in muted mono beneath, a vertical hairline and a 2x2 grid of capability dots.
   Under the eyebrow: the prompt name in bold mono and its description in muted text.
2. *Config columns* - left column with three eyebrow-titled label/value groups: `TOOL`
   (Tool choice, Parallel calls), `CONTEXT` (Chat history, Past tool calls, Reasoning in history),
   `REASONING` (Effort, Max tokens, Exclude from response). `on` values are tinted with the side
   accent; `off` and `-` are muted. Middle column stacks `[icon] INPUT SCHEMA` over
   `(x) VARIABLES` (`data-variables-section`), each showing its content or the muted word `None`.
3. *Right rail* - four stacked, hairline-separated sections with coloured eyebrows: `[TS] FUNCTIONS`
   (blue), `SUB-PROMPTS` (fuchsia), `HANDOFFS` (sky), `SUB-AGENTS` (emerald). Each lists names in mono
   or shows `None`.

**`human` card.** Flat white, 1px amber `#fe9a00` border, rounded. Header row `[person icon] Human`,
a full-width hairline, then a single muted line `Receives user messages and input.` No model anchor,
no tool columns, no config rows.

## States

- **Loading**: provider icon shimmer in the model chip (prompt kind).
- **Empty**: empty rail/schema/variables sections render the muted word `None` rather than hiding.
- **Error**: icon failure falls back to generic glyph.

## Measurement anchors

- `data-model-anchor` on the header model chip (vertical center is the model edge origin).
- `data-variables-section` on the Variables block.
- `data-tool-column="<kind>"` on each rail section, so structural edges can leave from the correct
  column top.

## Theming

Side tint comes from `theme.node.sideAccent` (`a: #00a6f4` sky, `b: #fe9a00` amber) and drives the card
border, the side pill, the side eyebrows and the "on" value text. Note the accent is on the **card
border**, not on the edges - `theme.edge.colors.*` are all neutral in the shipped theme. Prompt vs human
layout is data-driven (registry kind), not theme-driven. Card chrome from `theme.node`
(`elevation: 'none'` - no `box-shadow`).
