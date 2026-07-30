# View Spec: ModelsView

## Route

- Path: `/models`
- Name: `models`
- Auth: requires authenticated session (`GET /api/auth/me` guard in router)

## Purpose

Manage the catalog of configured AI models. Admins list all models, see which provider each belongs to, inspect capabilities, copy a ready-to-run curl command, and create or edit models through `ModelModal`.

## Layout

Standard app shell: `Sidebar` on the left, content area on the right. The content area is a page header (title + count + subtitle + primary action), a filter row, and a full-width `DataTable` card. There is **no pagination control**.

Measured from `models-1512-light.png` (viewport 1512, CSS px): identical shell geometry to `/prompts` - content column x `272.5` -> `1462`, card `1189px` wide with `1px --color-border` and radius `12px`, header row `40px` on `--color-neutral-50`, data rows `60px`, dividers `--color-neutral-200`.

- Title `Models` + count `(1)` in `--color-neutral-400`
- Subtitle `Configure AI models from your connected providers. Models define which AI capabilities are available to your agents.`
- Primary action `+ Add Model`, `36px` tall, radius `8px`, fill `#000` (dark: inverted to white/black)
- Filter row: search `Search models...` (`448x38`) + `All Models` select (`220x38`) + `All Providers` select (`220x38`), `12px` gaps

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Models (1)                                 [ + Add Model ]   |
|        |  Configure AI models from your connected providers. Models    |
| Side   |  define which AI capabilities are available to your agents.    |
| bar    |  [ (o) Search models... ] [ All Models v ] [ All Providers v ] |
|        | +----------------------------------------------------------+ |
|        | | NAME ^v      | MODEL ^v            | PROVIDER ^v | FALLBACKS | ACTIONS |
|        | |--------------+---------------------+-------------+-----------+---------|
|        | | (o) default  | deepseek/deepseek-v4-flash | (o) openrouter | None | [/] [x] |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

ModelModal (overlay):
+--------------------------------------------------+
| Add Model                                      X |
|--------------------------------------------------|
| Provider*    [ autocomplete.................v ]  |
| Model*       [ search available models....... ]  |
|              | gpt-4o                          | |
|              | gpt-4o-mini                     | |
|              [ Load more ]                     |
| Name         [ ______________________________ ]  |
| Capabilities [text] [vision] [tools]  (badges)   |
| Endpoints    /chat/completions  (list)           |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

Column set as captured: `NAME` (sortable, prefixed by the model's provider glyph) | `MODEL` (sortable, rendered in `--font-mono`) | `PROVIDER` (sortable, prefixed by the provider icon) | `FALLBACKS` (`None` in muted `--color-neutral-400` when empty) | `ACTIONS` (pencil + trash icon buttons, right-aligned).

Header labels use the shared `DataTable` header style: `11px`, uppercase, letter-spacing ~`0.05em`, `--color-neutral-500`. This is **not** the agents-composition grid header style (`11px/600`, no tracking, not uppercase).

## Components used

- `DataTable` - model list with search, sort, row actions
- `ModelModal` - create/edit form
- `ConfirmDialog` - delete confirmation (via DataTable action `confirm`)
- `UiButton` - primary action
- `SearchInputWrapper` - table search
- `CopyButton` - copy curl command in row expand/detail
- `UiCodeBlock` - render curl command

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/models` | List models (response `{ models: ModelSummary[] }`, includes fallbacks) |
| GET | `/api/models/:name` | Row detail / prefill edit form |
| GET | `/api/models/:name/curl-data` | Curl command for the copy block |
| POST | `/api/models/available` | Provider model search inside ModelModal |
| POST | `/api/models/capabilities` | Capability badges for a selected model |
| POST | `/api/models/endpoints` | Endpoint list for a selected model |
| GET | `/api/providers` | Provider options for the modal selector |
| GET | `/api/providers/:name/icon` | Provider icons in table and selector |

Model create/update/delete is file-backed on the server; the UI submits through the same `/api/models` resource path and re-fetches the list after save.

## Interactions

1. On mount: fetch `/api/models` and `/api/providers` in parallel.
2. Search input (debounced 300ms via `SearchInputWrapper`) filters rows client-side by name/provider/model id; the `All Models` and `All Providers` selects narrow by model id and provider.
3. Column header click toggles sort (asc/desc) on `NAME`, `MODEL`, `PROVIDER` (`FALLBACKS` and `ACTIONS` are not sortable).
4. "+ Add Model" opens `ModelModal` with empty state.
5. Row "Edit" action opens `ModelModal` prefilled from `GET /api/models/:name`.
6. Row "Delete" action opens `ConfirmDialog`; on confirm, delete and re-fetch list.
7. Row expand (or "curl" action) fetches `/api/models/:name/curl-data` and renders it in `UiCodeBlock` with a `CopyButton`.
8. Modal save success: toast/alert via `UiAlertBox`, close modal, re-fetch list.

## States

- Loading: skeleton rows in `DataTable` (`loading` prop).
- Empty: `emptyMessage` "No models configured yet. Add your first model."
- Error: `UiAlertBox` variant `error` with retry button.
- Modal: idle, saving (submit button `loading`), server-error (inline form errors).

## Theming

All colors come from tokens: card surface `--color-background` (`#ffffff` / `#0a0a0a`) over the `bg-neutral-50/80` page, border `--color-border` (`#d4d4d4` / `#404040`), header bar `--color-neutral-50` / `--color-neutral-900`, header label `--color-neutral-500`, row divider `--color-neutral-200` / `--color-neutral-800`, body text `--color-neutral-700`, muted cells (`None`) `--color-neutral-400`.

The primary `+ Add Model` button is the **inverted** primary (black on white in light, white on black in dark), not `--accent-600`; changing the accent ramp does not recolor it. Provider icons are server-supplied images and are not themed. Capability badges use the emerald semantic pair (supported) and the neutral pair (unsupported). Row hover/selection use the accent-derived agents surfaces (`#f8f2ff` / `#efe3ff` light, `#1c1525` / `#302043` dark), never a flat `#a855f7`.

The card has **no** `box-shadow`; depth exists only on overlays via `DropShadow` (`offsetX/offsetY 6`, `pattern "diagonal"`). Dark mode follows the `.dark` root class.
