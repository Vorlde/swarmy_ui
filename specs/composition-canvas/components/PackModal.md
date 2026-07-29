# PackModal

Project: **swarmy_ui**. Modal for packaging an agent and its dependency closure into a publishable package.

## Purpose

Collects package name/version, runs dependency analysis, lets the user choose extract-vs-copy per dependency (ExtractCopyToggle inside DependencyTree), and executes the pack.

## Props

```ts
interface Props {
  agentId: string;
  open: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `close` | - | cancel / backdrop / Escape |
| `packed` | `{ packageId: string }` | pack succeeds (parent opens PublishModal and refreshes catalog) |

## Slots

| Slot | Purpose |
|---|---|
| `dependency-row` | override DependencyTree row rendering |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/pack/{id}/analyze` | on open |
| `GET /api/pack/{id}/metadata` | on open (name/version suggestions) |
| `POST /api/pack/{id}` | Pack button; body includes per-item extract/copy decisions |

## Visual behavior

Two sections: metadata form (package name, version) and dependency analysis (DependencyTree). Analyze runs automatically on open; a manual Analyze button re-runs it after edits. Pack button disabled until analysis succeeds and name/version validate. On success the modal closes and emits `packed`.

## States

- **Loading**: tree skeleton while analyze runs; Pack button spinner during POST.
- **Empty**: agent with zero dependencies shows "No dependencies - this package contains only the agent".
- **Error**: analyze or pack failure shows the server message inline; form state is preserved.

## Theming

Modal chrome from shared modal tokens (`--color-surface`, overlay color, `--radius-lg`, shadow). Form controls and the tree use their own component tokens; nothing in PackModal hardcodes color or spacing.
