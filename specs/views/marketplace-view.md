# View Spec: MarketplaceView

## Route

- Path: `/marketplace`
- Name: `marketplace`
- Auth: requires authenticated session

## Purpose

Browse the agent pack marketplace, inspect a pack's README and metadata, and install packs into the local workspace (unpack) or publish local agents (pack/publish entry points).

## Layout

App shell with `Sidebar`. Unlike the other list views, the header is a **single row**: the title block sits on the left and the controls sit on the right of the same row, with no separate filter row below.

- Left: title `Marketplace` (bold, `~20px`) with the subtitle directly under it:
  `Public packages for swarmy_ui - install agents, tools, and prompts into this instance.`
- Right: `SearchInputWrapper` (placeholder `Search packages...`) and, immediately after it with a `~12px` gap, a **native `<select>`** whose options are `Recently updated` / `Most installed`. It renders with the platform chevron and a `1px --color-border` / radius `8px` / white surface shell - it is a real `<select>`, not a segmented tab group.

Below the header, the package list occupies the rest of `main`.

**Empty state (the state actually captured on this instance):** a vertically stacked, horizontally centered block near the top of the content area - a `Store` glyph (`~40px`, `--color-neutral-400`) above the single line:

> No packages have been published yet.

rendered at `15px` in the muted text token. In this state `main` contains **zero links and zero buttons** besides the two header controls: no "Publish", no "Browse", no card grid, no detail pane, no install bar.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        | Marketplace              [ (o) Search packages... ] [Recently updated v] |
|        | Public packages for swarmy_ui - install agents, tools,        |
| Side   | and prompts into this instance.                               |
| bar    |                                                               |
|        |                          [ store glyph ]                      |
|        |                 No packages have been published yet.          |
|        |                                                               |
+--------+--------------------------------------------------------------+
```

Populated state (**not capturable** - this instance has no published packages, so the card/detail layout below is a design intent, not an observed fact): a searchable grid of package cards with a detail pane rendering the package README.

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
2. Search (debounced) re-queries the package list; the sort `<select>` re-queries with `Recently updated` (default) or `Most installed`.
3. Selecting a card loads the package detail and README; README markdown renders inside the `marketplace-readme` prose container.
4. "Install" first calls `GET /api/unpack/:packageId/analyze`; if conflicts exist, list them in a `ConfirmDialog`; otherwise proceed to `POST /api/unpack/:packageId`.
5. Install progress and result show via `UiAlertBox`; success prompts navigation to the installed agent.
6. If `npm-token-status` reports missing credentials, show a warning banner with a link to provider settings.

## States

- Loading list; **empty registry (captured): `Store` glyph + exactly `No packages have been published yet.`**; empty search result; list error with retry.
- Detail: loading, loaded, README missing (metadata only).
- Install: idle, analyzing, confirm-conflicts, installing, success, failed.

## Theming

Cards use `--color-background` surfaces with `--color-border` at radius `--radius-xl`. Elevation is **not** `box-shadow`: nothing in this app uses `shadow-sm`/`shadow-md` except the theme-toggle knob. If a package card needs depth, it must come from the shared `DropShadow` component (`components/drop-shadow.md`) with `offsetX`/`offsetY` `6` and `pattern: "diagonal"`; hover changes surface tint, not shadow.

Empty-state glyph and copy use `--color-neutral-400` and the muted text token. The README prose container (`.marketplace-readme`) inherits typography tokens (`--font-sans`, heading weights) and code blocks inside it use the shared code theme. The selected-card surface is the shared accent-derived selection token `--agents-accent-surface-selected` (`#efe3ff` light / `#302043` dark), never a flat `#a855f7`. All values are overridable through the token layer without touching markup.
