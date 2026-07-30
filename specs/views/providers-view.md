# View Spec: ProvidersView

## Route

- Path: `/providers`
- Name: `providers`
- Auth: requires authenticated session

## Purpose

List the installed AI providers (Cloudflare Workers AI, OpenRouter, etc.) and show whether each one has an API key configured. **Provider availability is defined in code and environment configuration**, so this view is read-only apart from a per-row delete that clears the stored key.

## Layout

App shell with `Sidebar`. Content area is a page header, a search row, and a `DataTable` card. There is **no primary action button** and, in the captured build, **no per-row edit action and no configure modal** - the only row affordance is a trash icon button.

Measured from `providers-1512-light.png` (viewport 1512, CSS px): same shell geometry as `/prompts` and `/models` - content column x `272.5` -> `1462`, card `1189px`, `1px --color-border`, radius `12px`, header row `40px` on `--color-neutral-50`, data rows `60px`.

- Title `Providers` + count `(2)` in `--color-neutral-400`
- Subtitle `Installed providers and API key status. Provider availability is defined in code and environment configuration.`
- Search `Search providers...` (`448x38`), alone on its row (no selects)

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Providers (2)                                                |
|        |  Installed providers and API key status. Provider             |
| Side   |  availability is defined in code and environment configuration.|
| bar    |  [ (o) Search providers...      ]                             |
|        | +----------------------------------------------------------+ |
|        | | NAME ^v                        | API KEY        | ACTIONS  | |
|        | |--------------------------------+----------------+----------| |
|        | | (cf) Cloudflare Workers AI     | (x) Not configured |  [x]  | |
|        | | (or) OpenRouter                | (v) Configured     |  [x]  | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

Column set as captured: `NAME` (sortable, prefixed by the provider icon at `~20px`, label at `15px` in `--color-text`) | `API KEY` (a status pill) | `ACTIONS` (trash icon button only, right-aligned).

Status pills (`rounded-full`, icon + label, `~13px`), measured:

| State | Surface | Icon + label |
|---|---|---|
| `Configured` | `#dcfce7` (green-100) | check glyph + text `#008236` (green-700) |
| `Not configured` | `#f5f5f5` (`--color-neutral-100`) | `X` glyph + text `#737373` (`--color-neutral-500`) |

## Components used

- `DataTable` - provider list
- `ConfirmDialog` - delete confirmation for the trash action
- `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/providers` | List providers and configuration status |
| GET | `/api/providers/:name/icon` | Provider icon (data URI SVG) |
| GET | `/api/providers/:name/tools` | Tools exposed by a provider (not surfaced in the captured UI) |
| PATCH | `/api/envs/instance` | Clear a provider's stored API key (trash action) |

## Interactions

1. On mount: fetch `/api/providers`; icons load lazily per row from the icon endpoint.
2. Search filters rows by name.
3. Column header click toggles sort on `NAME`.
4. The trash action clears the provider's stored API key via `PATCH /api/envs/instance`, guarded by `ConfirmDialog`, then re-fetches.
5. Adding or changing an API key is **not** done here in the captured build - it happens through `/settings/instance-variables` (see `views/variables-view.md`) or the environment configuration.

## States

- Loading, empty (`DataTable` empty block), error with retry.
- Per-row API-key status: `Configured` (green pill) or `Not configured` (neutral pill). No warning/danger third state was observed.

## Theming

Status pills map to semantic token pairs: `Configured` = the green/emerald semantic pair (`green-100` surface / `green-700` text), `Not configured` = the neutral pair (`--color-neutral-100` surface / `--color-neutral-500` text). Swap by overriding those semantic tokens; the component contains no literal colors. Provider icons are server-supplied images and are not themed.

Card surface `--color-background`, border `--color-border`, header bar `--color-neutral-50`, header label `--color-neutral-500` at `11px` uppercase, dividers `--color-neutral-200` - the shared `DataTable` token set, with dark pairs applied under `.dark`. The card has **no** `box-shadow`; depth in this app comes only from `DropShadow` on overlays.
