# PromptCard

Project: **swarmy_ui**. Card for a prompt, used both for prompt-tools on the canvas and as the inner body of AI side nodes.

## Purpose

Displays a `PromptData`: name, pinned model, variable list, and (optionally) a body preview. Exposes the model anchor for dashed model edges.

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

Header: doc icon + prompt name. Model row (`data-model-anchor`): `model: <modelName>` + provider icon. VariablesList when variables exist. Compact mode hides the body preview and schema line. Max turns badge shown when `maxTurns` is set.

## States

- **Loading**: provider icon shimmer.
- **Empty**: unpinned model shows `model: default` in muted text; no variables hides the list.
- **Error**: icon fallback glyph.

## Measurement anchors

`data-model-anchor` on the model row.

## Theming

Card chrome from `theme.node`. The model row's accent background and border use a dedicated `prompt.modelRowBackground` theme token so a theme can restyle it (filled chip vs flat row) without structural changes.
