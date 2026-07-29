# View Spec: MarketplaceView

## Route

- Path: `/marketplace`
- Name: `marketplace`
- Auth: requires authenticated session

## Purpose

Browse the agent pack marketplace, inspect a pack's README and metadata, and install packs into the local workspace (unpack) or publish local agents (pack/publish entry points).

## Layout

App shell with `Sidebar`. Content is a two-pane layout: a searchable grid/list of package cards on the left/center, and a detail pane (rendered README via markdown) for the selected package. An install bar appears when a package is selected.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Marketplace                                                 |
|        |  [Search packages...                         ]               |
| Side   |+---------------------------+--------------------------------+|
| bar    || +---------+ +---------+   |  acme/support-agent-pack       ||
|        || | pack    | | pack    |   |  v1.2.0 - by acme              ||
|        || | card    | | card    |   |  [Install]                     ||
|        || +---------+ +---------+   |  -----------------------------  ||
|        || +---------+ +---------+   |  README (markdown rendered)    ||
|        || | pack    | | pack    |   |  # Support Agent Pack          ||
|        || +---------+ +---------+   |  This pack contains...         ||
|        |+---------------------------+--------------------------------+|
+--------+--------------------------------------------------------------+
```

## Components used

- `SearchInputWrapper` - package search
- `UiButton` - Install action
- `UiAlertBox` - install progress/result
- `UiCodeBlock` - code samples inside README
- `CopyButton` - copy install command/package id

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/platform/**` | Proxied marketplace API (package list, detail, README) |
| GET | `/api/platform-endpoint` | Resolve the marketplace base endpoint |
| POST | `/api/unpack/:packageId` | Install a package into the workspace |
| GET | `/api/unpack/:packageId/analyze` | Pre-install analysis (contents, conflicts) |
| POST | `/api/pack/:agentName/publish` | Publish a local agent (from agent views) |
| GET | `/api/pack/npm-token-status` | Whether registry credentials are configured |

## Interactions

1. On mount: resolve `/api/platform-endpoint`, then fetch the package list through the `/api/platform/**` proxy.
2. Search (debounced) re-queries the package list.
3. Selecting a card loads the package detail and README; README markdown renders inside the `marketplace-readme` prose container.
4. "Install" first calls `GET /api/unpack/:packageId/analyze`; if conflicts exist, list them in a `ConfirmDialog`; otherwise proceed to `POST /api/unpack/:packageId`.
5. Install progress and result show via `UiAlertBox`; success prompts navigation to the installed agent.
6. If `npm-token-status` reports missing credentials, show a warning banner with a link to provider settings.

## States

- Loading list, empty search result ("No packages match your search"), list error with retry.
- Detail: loading, loaded, README missing (metadata only).
- Install: idle, analyzing, confirm-conflicts, installing, success, failed.

## Theming

Cards use `--color-background-soft` surfaces with `--color-border` and `shadow-sm` elevation; hover raises to `shadow-md`. The README prose container (`.marketplace-readme`) inherits typography tokens (`--font-sans`, heading weights) and code blocks inside it use the shared code theme. Accent tokens drive the Install button and selected-card ring. All values are overridable through the token layer without touching markup.
