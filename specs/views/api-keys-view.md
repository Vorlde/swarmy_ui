# View Spec: ApiKeysView

## Route

- Path: `/api-keys`
- Name: `api-keys`
- Auth: requires authenticated session (endpoints are hosted-only; view shows an "unavailable" state in local dev)

## Purpose

Create and revoke API keys for programmatic access to the platform. A newly created key is shown exactly once in a reveal dialog with a copy button.

## Layout

App shell with `Sidebar`. Content is a `DataTable` of existing keys (name, prefix, created, last used) with a primary "Create Key" action. Creation opens a small `Modal` (name + optional expiry); success opens a one-time reveal `Modal` containing the full key, a `UiCodeBlock`, and a `CopyButton`.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  API Keys                             [+ Create Key]         |
|        |  Keys for accessing the API programmatically.                |
| Side   | +----------------------------------------------------------+ |
| bar    | | Name      | Prefix   | Created    | Last used  | Actions | |
|        | |-----------+----------+------------+------------+---------| |
|        | | ci-deploy | sw_sk_a1 | 2024-05-01 | 2024-05-20 | Revoke  | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

Reveal modal (shown once after create):
+--------------------------------------------------+
| Key created                                    X |
|--------------------------------------------------|
| Copy this key now. It will not be shown again.   |
| +----------------------------------------------+ |
| | sw_sk_a1b2c3d4e5...                 [Copy]   | |
| +----------------------------------------------+ |
|                                         [Done]   |
+--------------------------------------------------+
```

## Components used

- `DataTable` - key list
- `Modal` - create dialog and reveal dialog
- `ConfirmDialog` - revoke confirmation
- `CopyButton` - copy the revealed key
- `UiCodeBlock` - key display
- `UiButton`, `UiAlertBox`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/api-keys` | List keys (hosted only) |
| POST | `/api/api-keys` | Create key `{ name, expiresAt? }`, response contains the full key once |
| DELETE | `/api/api-keys/:id` | Revoke key |

## Interactions

1. On mount: fetch `/api/api-keys`. If the server responds 404/403 (local dev), render the unavailable state.
2. "+ Create Key" opens the create modal; submit posts and stores the returned key in memory only.
3. On create success: close the create modal, open the reveal modal, re-fetch the list.
4. The reveal modal cannot be reopened after close; closing clears the key from memory.
5. "Revoke" uses `ConfirmDialog`; on confirm, `DELETE /api/api-keys/:id` and re-fetch.

## States

- Loading, empty ("No API keys yet"), error with retry.
- Unavailable (local dev): `CenteredContentView` explaining keys require hosted mode.
- Create: idle, creating, reveal.
- Revoke: confirming, revoking.

## Theming

The reveal modal emphasizes the key using `--font-mono` on a `--color-background-mute` surface with `--color-border`. Warning copy about one-time display uses amber semantic tokens. Everything else inherits the shared table/modal/button token styling, so a theme swap needs no view changes.
