# View Spec: UsersView

## Route

- Path: `/settings/users` (reached from the sidebar **gear popover** -> `Users`; the gear button shows its active state while any `/settings/*` route is open)
- Name: `settings-users`
- Auth: admin only (router guard checks `role === "admin"` from `GET /api/auth/me`)

## Purpose

Admin-only user management. List users, create new users, edit roles and credentials, and delete users. Also surfaces each user's environment variables for inspection.

## Layout

App shell with `Sidebar`. Content is a page header and a `DataTable` card. There is **no search field** on this page - the table sits directly under the header.

Measured from `settings-users-1512-light.png` (viewport 1512, CSS px): content column x `272.5` -> `1462`; the card starts at y `~120`, header row `40px`, and the empty block gives the card a `~240px` minimum body height.

- Title `Users` (bold, `~20px`), no count badge
- Subtitle `Manage user accounts and permissions` (no trailing period)
- Primary action `Add User` - black pill, `36px` tall, radius `8px`, label `14px/500`, **no leading `+` icon**

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Users                                        [ Add User ]    |
|        |  Manage user accounts and permissions                         |
| Side   | +----------------------------------------------------------+ |
| bar    | | USERNAME      | ROLE          | CREATED       | ACTIONS   | |
|        | |---------------+---------------+---------------+-----------| |
|        | |                    ( inbox glyph )                        | |
|        | |                    No users found                         | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

User modal:
+--------------------------------------------------+
| Add User                                       X |
|--------------------------------------------------|
| Username*    [ ______________________________ ]  |
| Password*    [ ______________________________ ]  |
| Role*        ( ) user   ( ) admin                |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

Column set as captured: `USERNAME` | `ROLE` | `CREATED` | `ACTIONS` (right-aligned). None of the four headers shows a sort glyph. Header labels use the shared `DataTable` style: `11px`, uppercase, letter-spacing ~`0.05em`, `--color-neutral-500`, on a `--color-neutral-50` bar with a `1px --color-border` bottom rule.

The empty block is centered in the card body: a `~64px` circular `--color-neutral-100` badge holding an inbox glyph in `--color-neutral-400`, and the line `No users found` in the muted text token at `15px`.

## Components used

- `DataTable` - user list
- `Modal` - create/edit dialog
- `ConfirmDialog` - delete confirmation
- `UiButton`, `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user `{ username, password, role }` |
| PUT | `/api/users/:id` | Update user (role, password reset) |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/:id/env` | Inspect a user's env variables (expanded row) |

## Interactions

1. On mount: fetch `/api/users`; also fetch `/api/auth/me` to know the current admin's id.
2. The current admin's own row hides the Delete action (`visible` callback on the action).
3. "Add User" opens the modal empty; "Edit" prefills (password field blank, meaning unchanged).
4. Save: create via `POST /api/users` or update via `PUT /api/users/:id`; then re-fetch.
5. Delete uses `ConfirmDialog` with the username interpolated into the message.
6. Row expand fetches `/api/users/:id/env` and shows env keys (secret values masked).

## States

- Loading, **empty (captured): circular inbox badge + exactly `No users found`**, error with retry.
- Non-admin access: router redirects to `/` before this view renders.
- Modal: idle, saving, server-error (e.g. duplicate username shown inline).

## Theming

Standard token-driven table and modal: card surface `--color-background`, border `--color-border`, header bar `--color-neutral-50` / `--color-neutral-900`, header label `--color-neutral-500`, dividers `--color-neutral-200` / `--color-neutral-800`, empty-state badge `--color-neutral-100` with a `--color-neutral-400` glyph.

The `Add User` button is the **inverted** primary (black on white light, white on black dark), not `--accent-600`. Role badges: `admin` uses accent tokens (`--accent-100`/`--accent-700`), `user` uses neutral tokens. The danger delete action uses the red semantic tokens. The card carries **no** `box-shadow`; the modal gets its depth from `DropShadow` (`offsetX`/`offsetY` `6`, `pattern "diagonal"`). Everything is overridable through the theme token layer; no view-specific colors exist.
