# ModelNode

Project: **swarmy_ui**. Card for a model catalog entry referenced by a prompt. Registered in the node-type registry under `kind: 'model'`; its root element carries `data-canvas-model-node`.

## Purpose

Shows provider icon, model display name, upstream model id, provider, capability chips, context/output token limits, pricing, and fallback count. Target of dashed `model` edges.

## Props

```ts
interface Props {
  data: ModelNodeData;
  selected?: boolean;
  hovered?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | - | card click |
| `edit-surface` | `EditTarget` (`{ entityType: 'model', entityId: data.id }`) | edit button |

## Slots

None.

## API calls

| Endpoint | When |
|---|---|
| `GET /api/providers/{provider}/icon?model={model}` | on mount; cached per `provider:model` for the session |

## Visual behavior

Flat white card, 1px `#d4d4d4` border, rounded, no shadow. Three bands separated by full-width hairlines:

1. *Header* - eyebrow `[gear icon] MODEL` plus a `rounded-full` outlined pill with the provider name in
   caps (`OPENROUTER`). Below: provider icon + model display name (`default`) in bold; the upstream
   model id in muted mono, truncated with an ellipsis (`deepseek/deepseek-v4-fla...`); then the price
   line `in $0.09-$0.2/M   out $0.18-$0...`, also muted and truncated, using `pricingRange` when
   present.
2. *Capabilities* - a **2-column grid of hairline-separated cells**, not a chip row. Each cell is a
   leading dot plus a label: `Vision`, `Tool Calls`, `Streaming`, `JSON`. Supported = green dot,
   unsupported = neutral dot with muted label.
3. *Limits* - two cells: eyebrow `MAX CONTEXT` over the thousands-separated value, and `MAX OUTPUT`
   over its value.

There is no `fallbacks: N` footer in the reference capture.

## States

- **Loading**: icon slot shows a shimmer square until the icon request resolves.
- **Empty**: missing capabilities/limits simply omit those cells.
- **Error**: icon failure falls back to a generic model glyph; card still renders.

## Measurement anchors

Target only; no anchors of its own. Incoming model edges anchor to card top-center (or left-center for outboard-left placement).

## Theming

Capability dots use `theme.node.mutedTextColor` when off and the success hue when on; cell dividers use `theme.node.borderColor`. Provider icon well, price typography, and the capability set are all theme-token driven so a "minimal" theme can hide the capability band entirely via a display token without code changes. Card chrome from `theme.node` with `elevation: 'none'`.
