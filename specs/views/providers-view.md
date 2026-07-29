# View Spec: ProvidersView

## Route

- Path: `/providers`
- Name: `providers`
- Auth: requires authenticated session

## Purpose

Configure AI providers (OpenAI, Anthropic, OpenRouter, etc.). Each provider entry holds connection settings and credentials (API keys). Admins list providers, see which are configured, and edit credentials and settings.

## Layout

App shell with `Sidebar`. Content area is a `DataTable` of providers with an edit action per row; editing opens a `Modal` containing a `SchemaEditor`-driven form (shadcn-vue fields bound with VeeValidate, validated by a Zod schema) built from the provider's settings schema.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Providers                                                   |
|        |  Connect AI providers and manage credentials.                |
| Side   |  [Search providers...                         ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Icon | Name      | Status      | Models | Actions        | |
|        | |------+-----------+-------------+--------+----------------| |
|        | | (o)  | openai    | configured  | 12     | Edit           | |
|        | | (a)  | anthropic | missing key | 0      | Edit           | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

Edit modal:
+--------------------------------------------------+
| Configure openai                               X |
|--------------------------------------------------|
| API Key*     [ ****************************** ]  |
| Base URL     [ https://api.openai.com/v1______ ]  |
| Organization [ ______________________________ ]  |
|--------------------------------------------------|
|        [Test Connection]       [Cancel] [Save]   |
+--------------------------------------------------+
```

## Components used

- `DataTable` - provider list
- `Modal` - edit dialog
- `SchemaEditor` - dynamic credential/settings form
- `UiButton`, `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/providers` | List providers and configuration status |
| GET | `/api/providers/:name/icon` | Provider icon (data URI SVG) |
| GET | `/api/providers/:name/tools` | Tools exposed by a provider (shown in edit modal) |
| PATCH | `/api/envs/instance` | Persist provider credentials/settings (instance env) |

## Interactions

1. On mount: fetch `/api/providers`; icons load lazily per row from the icon endpoint.
2. Search filters rows by name.
3. Row "Edit" opens the modal with the provider's schema rendered by `SchemaEditor`; secret fields render as password inputs.
4. "Test Connection" runs a lightweight availability check (`POST /api/models/available` with `{ provider }`) and shows result via `UiAlertBox`.
5. Save submits `PATCH /api/envs/instance` with the changed keys, then re-fetches providers.
6. Unsaved changes guard: modal `hasChanges` triggers `ConfirmDialog` on close.

## States

- Loading, empty ("No providers available"), error with retry.
- Per-row status: `configured` (success badge), `missing key` (warning badge), `error` (danger badge).
- Modal: idle, testing, saving, server-error.

## Theming

Status badges map to semantic token pairs: success `emerald`, warning `amber`, danger `red` scales from the token set; swap by overriding the semantic color tokens. Icons come from the server and are not themed. Modal surface uses `--color-background-soft` and `--color-border`. All form input styling is driven by the shared form theme tokens, so a global form reskin applies here automatically.
