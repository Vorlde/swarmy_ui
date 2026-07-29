# ModelNode

Project: **swarmy_ui**. Card for a model catalog entry referenced by a prompt.

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

Header row: provider icon + name, upstream `model` id in mono below, provider name in muted text. Capability chips (images, tool calls, streaming, JSON mode) render dimmed when unsupported. Stats line: `ctx N - out M`. Price line: `in $x-y - out $x-y /1M` (uses `pricingRange` when present, else flat prices). Footer: `fallbacks: N` when non-empty.

## States

- **Loading**: icon slot shows a shimmer square until the icon request resolves.
- **Empty**: missing capabilities/limits simply omit those rows.
- **Error**: icon failure falls back to a generic model glyph; card still renders.

## Measurement anchors

Target only; no anchors of its own. Incoming model edges anchor to card top-center (or left-center for outboard-left placement).

## Theming

Capability chips use `theme.node.mutedTextColor` when off and the accent color when on; chip shape via `theme.node.borderRadius`. Provider icon well, price typography, and chip set are all theme-token driven so a "minimal" theme can hide chips entirely via a display token without code changes.
