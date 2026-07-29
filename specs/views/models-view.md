# View Spec: ModelsView

## Route

- Path: `/models`
- Name: `models`
- Auth: requires authenticated session (`GET /api/auth/me` guard in router)

## Purpose

Manage the catalog of configured AI models. Admins list all models, see which provider each belongs to, inspect capabilities, copy a ready-to-run curl command, and create or edit models through `ModelModal`.

## Layout

Standard app shell: `Sidebar` on the left, content area on the right. The content area is a full-width `DataTable` with a header row (title, description, primary action button).

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Models                                    [+ Add Model]     |
|        |  Configure the AI models available to your agents.           |
| Side   |  [Search models...                            ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name        | Provider   | Model ID          | Actions   | |
|        | |-------------+------------+-------------------+-----------| |
|        | | default     | openrouter | deepseek/deepseek | Edit Del  | |
|        | | gpt-4o      | openai     | gpt-4o            | Edit Del  | |
|        | +----------------------------------------------------------+ |
|        |  < 1 2 3 >                                                   |
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
2. Search input (debounced 300ms via `SearchInputWrapper`) filters rows client-side by name/provider/model id.
3. Column header click toggles sort (asc/desc) on sortable columns.
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

All colors come from tokens: table surface `--color-background-soft`, borders `--color-border` / `--color-border-hover`, header text `--color-text`. Provider icons are images and not themed. Capability badges use `--accent-100`/`--accent-700` (light) and `--accent-900`/`--accent-300` (dark). Changing the accent scale re-skins badges, primary button, and focus rings with no logic changes. Dark mode follows the `.dark` root class.
