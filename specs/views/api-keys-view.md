# View Spec: ApiKeysView

## Route

- Path: `/settings/api-keys` (reached from the sidebar **gear popover** -> `API Keys`; the gear button shows its active state while any `/settings/*` route is open)
- Name: `settings-api-keys`
- Auth: requires authenticated session. The captured local instance renders the normal list + empty state, so there is **no** "hosted-only / unavailable" screen in the captured build.

## Purpose

Create and revoke API keys for programmatic access to the platform. A newly created key is shown exactly once in a reveal dialog with a copy button.

## Layout

App shell with `Sidebar`. Content is a page header and a `DataTable` card, with **no search field** - identical page skeleton to `/settings/users`. Creation opens a small `Modal` (name + optional expiry); success opens a one-time reveal `Modal` containing the full key, a `UiCodeBlock`, and a `CopyButton`.

Measured from `settings-api-keys-1512-light.png` (viewport 1512, CSS px): content column x `272.5` -> `1462`; card top at y `~120`, header row `40px`, empty block gives a `~240px` minimum body height.

- Title `API Keys` (bold, `~20px`), no count badge
- Subtitle `Manage API keys for programmatic access` (no trailing period)
- Primary action `Create API Key` - black pill, `36px` tall, radius `8px`, label `14px/500`, **no leading `+` icon**

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  API Keys                               [ Create API Key ]    |
|        |  Manage API keys for programmatic access                      |
| Side   | +----------------------------------------------------------+ |
| bar    | | NAME     | API KEY     | CREATED   | LAST USED  | ACTIONS | |
|        | |----------+-------------+-----------+------------+---------| |
|        | |                    ( inbox glyph )                        | |
|        | |                  No API keys found                        | |
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

Column set as captured: `NAME` | `API KEY` | `CREATED` | `LAST USED` | `ACTIONS` (right-aligned). No sort glyphs. Header labels use the shared `DataTable` style: `11px`, uppercase, letter-spacing ~`0.05em`, `--color-neutral-500`, on a `--color-neutral-50` bar with a `1px --color-border` bottom rule.

The empty block is centered in the card body: a `~64px` circular `--color-neutral-100` badge holding an inbox glyph in `--color-neutral-400`, and the line `No API keys found` in the muted text token at `15px`.

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
| GET | `/api/api-keys` | List keys (available on the captured local instance) |
| POST | `/api/api-keys` | Create key `{ name, expiresAt? }`, response contains the full key once |
| DELETE | `/api/api-keys/:id` | Revoke key |

## Interactions

1. On mount: fetch `/api/api-keys` and render list or empty state.
2. "Create API Key" opens the create modal; submit posts and stores the returned key in memory only.
3. On create success: close the create modal, open the reveal modal, re-fetch the list.
4. The reveal modal cannot be reopened after close; closing clears the key from memory.
5. "Revoke" uses `ConfirmDialog`; on confirm, `DELETE /api/api-keys/:id` and re-fetch.

## States

- Loading, **empty (captured): circular inbox badge + exactly `No API keys found`**, error with retry.
- Create: idle, creating, reveal.
- Revoke: confirming, revoking.

## Theming

The reveal modal emphasizes the key using `--font-mono` on a `--color-background-mute` surface with `--color-border`. Warning copy about one-time display uses amber semantic tokens. The `Create API Key` button is the **inverted** primary (black on white light, white on black dark), not `--accent-600`. The list card carries **no** `box-shadow`; both modals get their depth from `DropShadow` (`offsetX`/`offsetY` `6`, `pattern "diagonal"`). Everything else inherits the shared table/modal/button token styling, so a theme swap needs no view changes.
