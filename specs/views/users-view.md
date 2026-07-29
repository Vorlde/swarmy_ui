# View Spec: UsersView

## Route

- Path: `/users`
- Name: `users`
- Auth: admin only (router guard checks `role === "admin"` from `GET /api/auth/me`)

## Purpose

Admin-only user management. List users, create new users, edit roles and credentials, and delete users. Also surfaces each user's environment variables for inspection.

## Layout

App shell with `Sidebar`. Content is a `DataTable` of users with a primary "Add User" action. Create/edit happens in a `Modal` with a small form (username, password, role).

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Users                                     [+ Add User]      |
|        |  Manage who can access this workspace.                       |
| Side   |  [Search users...                             ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Username    | Role        | Actions                      | |
|        | |-------------+-------------+------------------------------| |
|        | | admin       | admin       | Edit                         | |
|        | | jane        | user        | Edit Delete                  | |
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
3. "+ Add User" opens the modal empty; "Edit" prefills (password field blank, meaning unchanged).
4. Save: create via `POST /api/users` or update via `PUT /api/users/:id`; then re-fetch.
5. Delete uses `ConfirmDialog` with the username interpolated into the message.
6. Row expand fetches `/api/users/:id/env` and shows env keys (secret values masked).

## States

- Loading, empty ("No users found"), error with retry.
- Non-admin access: router redirects to `/` before this view renders.
- Modal: idle, saving, server-error (e.g. duplicate username shown inline).

## Theming

Standard token-driven table and modal. Role badges: `admin` uses accent tokens (`--accent-100`/`--accent-700`), `user` uses neutral tokens. The danger delete action uses the red scale tokens. Everything is overridable through the theme token layer; no view-specific colors exist.
