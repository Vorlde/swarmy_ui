# PublishModal

Project: **swarmy_ui**. Modal for publishing a packed package to a registry.

## Purpose

Lets the user pick a publish target (npm or a custom registry), checks npm token availability, and publishes.

## Props

```ts
interface Props {
  packageId: string;   // e.g. "@scope/fraud-review@0.1.0"
  open: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `close` | - | cancel / backdrop / Escape |
| `published` | `{ registry: string; url?: string }` | publish succeeds |

## Slots

| Slot | Purpose |
|---|---|
| `registry-option` | custom target option rendering |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/pack/npm-token-status` | on open; disables the npm option when no token |
| `POST /api/pack/{packageId}/publish` | Publish button; body `{ target }` |

## Visual behavior

Radio group of targets. npm option shows token status inline ("token configured" / "no token - set NPM_TOKEN"). Custom registry option reveals a URL input. Publish button disabled until a valid target is selected. Success shows the registry URL with a copy button before closing.

## States

- **Loading**: token status shimmer on open; Publish spinner during POST.
- **Empty**: no token and no custom registry URL leaves no selectable target with an explanatory note.
- **Error**: publish failure shows the server message inline; selection preserved.

## Theming

Modal chrome, radio inputs, and status text all use shared tokens. Success banner color uses the semantic success token.
