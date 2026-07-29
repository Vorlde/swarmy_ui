# PRD: Users

Feature area: user management.

## User stories

- As an admin, I can see all users with their role.
- As an admin, I can create a user with a username, password, and role.
- As an admin, I can edit a user's details and role.
- As an admin, I can delete a user (with confirmation).
- As an admin, I can view and edit a user's environment variables.
- As an admin, I can inspect a user's KV store.

## Functional requirements

1. UsersView: DataTable of users (username, role), search, create/edit modal,
   delete via ConfirmDialog.
2. User form: shadcn-vue + VeeValidate form (username, password, role) with
   Zod validation.
3. User env: per-user env editor (get/patch).
4. Self-service equivalents under `/api/users/me/**` used where the current
   user edits their own settings.
5. User KV: read/write/clear for the current user (me endpoints).

## Non-functional requirements

- Password fields never echo existing passwords; edits send new values only.
- Deleting a user always requires a ConfirmDialog.
- Role badges use UiBadge; table uses DataTable.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET/POST | `/api/users` | List / create users |
| PUT/DELETE | `/api/users/:id` | Update / delete a user |
| ANY | `/api/users/:id/**` | User sub-resources |
| GET/PATCH | `/api/users/:id/env` | Per-user env |
| ANY | `/api/users/me/**` | Current-user sub-resources |
| GET/PATCH | `/api/users/me/env` | Current-user env |
| GET/POST/DELETE | `/api/users/me/kv` | Current-user KV store |

## Acceptance criteria

- Users table lists users with role badges and supports search.
- Creating a user adds them to the list without a reload.
- Editing a user updates role/details; password change is optional.
- Deleting a user requires confirmation and removes them from the list.
- Per-user env can be viewed and patched.
- Form validation errors (duplicate username, weak input) display inline.
