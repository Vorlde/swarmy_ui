# View Spec: ToolsView

## Route

- Path: `/tools`
- Name: `tools`
- Auth: requires authenticated session

## Purpose

Manage the tool catalog available to agents. A tool has a name, description, optional JSON schema, and variables. Admins list tools, inspect their schemas, and create or edit tools via a modal.

## Layout

App shell with `Sidebar`. Content area is a `DataTable` of tools; row expand shows the tool description and a `JsonViewer` of its schema. Create/edit happens in a `Modal` with a form.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Tools                                     [+ Add Tool]      |
|        |  Tools your agents can call during a run.                    |
| Side   |  [Search tools...                             ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name                  | Type | Variables | Actions       | |
|        | |-----------------------+------+-----------+---------------| |
|        | | check_refund_policy   | tool | 0         | View Edit Del | |
|        | | close_ticket          | tool | 2         | View Edit Del | |
|        | +----------------------------------------------------------+ |
|        |  Expanded row:                                               |
|        |  +--------------------------------------------------------+  |
|        |  | Description: Check whether an order qualifies...       |  |
|        |  | Schema: { "type": "object", ... }      [JsonViewer]    |  |
|        |  +--------------------------------------------------------+  |
+--------+--------------------------------------------------------------+

Tool modal:
+--------------------------------------------------+
| Edit Tool                                      X |
|--------------------------------------------------|
| Name*        [ check_refund_policy___________ ]  |
| Description  [ textarea....................... ]  |
| Schema       [ code editor (JSON) ............ ]  |
| Variables    [ key/value rows... ] [+ Add]       |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

## Components used

- `DataTable` - tool list
- `Modal` - create/edit dialog
- `JsonViewer` - schema display in expanded row
- `UiCodeBlock` - schema editing in modal (JSON mode)
- `ConfirmDialog` - delete confirmation
- `UiButton`, `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/tools` | List tools (map of name -> `{ description, schema, variables, hasError, type }`) |
| GET | `/api/tools/:name` | Tool detail for edit prefill |
| GET | `/api/variables/tools/:name` | Variables referenced by a tool |

The tool list response is an object keyed by tool name; normalize to an array of rows `{ name, description, schema, variables, hasError, type }` before passing to `DataTable`.

## Interactions

1. On mount: fetch `/api/tools`, normalize the map to rows.
2. Search filters by name and description.
3. Row expand fetches nothing (schema is in the list payload) and renders `JsonViewer`.
4. "+ Add Tool" opens the modal empty; "Edit" prefills from `GET /api/tools/:name`.
5. Variables editor in the modal adds/removes key/value rows; rows marked `secret` mask their values.
6. Delete uses `ConfirmDialog`; on confirm, delete and re-fetch.
7. `hasError` tools show a danger badge and an error message in the expanded row.

## States

- Loading, empty ("No tools defined yet"), error with retry.
- Modal: idle, saving, server-error (inline).
- Expanded row: schema present (`JsonViewer`), schema null ("No schema defined" placeholder), error state (`hasError`).

## Theming

Table, modal, and badges all consume shared tokens. The `JsonViewer` syntax colors come from the dedicated JSON token set (key `--accent-600` light / `--accent-400` dark, etc.), so retheming JSON display is a token-only change. Error badge uses the red scale tokens. Code editor in the modal follows the code theme tokens and switches with the `.dark` class.
