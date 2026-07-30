# View Spec: VariablesView

## Routes

One component serves two settings routes, both reached from the sidebar **gear popover** (which lists `My Variables`, `Instance Variables`, `Users`, `API Keys`). The gear button stays in its active state while any `/settings/*` route is open.

| Path | Name | Card heading | Description line |
|---|---|---|---|
| `/settings/my-variables` | `settings-my-variables` | `My Variables` | `Defaults for your user account. These override instance values and are overridden by thread-specific values.` |
| `/settings/instance-variables` | `settings-instance-variables` | `Instance Variables` | `Defaults for the full swarmy_ui instance. These apply when a thread or user does not provide a more local value.` |

Auth: requires authenticated session.

## Purpose

Manage environment-style key/value variables at two scopes: the signed-in user, and the whole instance. Values can be flipped between plain text and secret.

## Layout

App shell with `Sidebar`. There is **no page title outside the card**, **no scope tab bar**, **no agent/prompt/tool scope selector**, and **no search field**. The whole page is a single bordered card at the content width, optionally preceded by a page-level `UiAlertBox`.

Measured from `settings-my-variables-1512-light.png` and `settings-instance-variables-1512-light.png` (viewport 1512, CSS px): content column x `272.5` -> `1462`; card `1189px` wide, `bg --color-background`, `1px --color-border`, radius `12px`.

Card contents, top to bottom:

1. **Heading** - `My Variables` / `Instance Variables`, bold `~19px`.
2. **Description line** - `15px`, `--color-text`.
3. **Resolution line** - `13px`, muted: `Resolution order: thread, user, instance, agent, then prompt.`
4. **Divider** - `1px --color-border` spanning the card's inner width.
5. **Stored-variable list** - when empty, a **dashed**-border box (`1px dashed --color-border`, radius `8px`, `~72px` tall) containing the left-aligned muted line `No stored variables yet.`
6. **Editor row** - a horizontal row: key input (placeholder in `--font-mono`, e.g. `WEATHER_API_KEY`, `~264px`), value input (placeholder `Value`, `~190px`), then, pushed to the far right, two square icon-buttons: a **lock** (toggle text/secret) and a **trash** (remove row). Inputs are `~38px` tall, `1px --color-border`, radius `8px`, white surface.
7. **Add link** - `Add another variable`, `15px`, muted, styled as a text button under the editor row.
8. **Divider**.
9. **Footer row** - helper copy on the left, `Secret values stay encrypted at rest and remain write-only until you switch them to text.` (`~13px`, muted); black `Save Variables` button on the right (`36px` tall, radius `8px`).

### Page-level alert (`/settings/my-variables` only, captured)

Above the card, full content width, an **error** `UiAlertBox`: surface `#fef2f2` (red-50), `1px` red-200-family border, radius `~12px`, circled-`X` glyph in the red-500 family, message in the red-600/700 family:

> Super admin sessions do not have per-user env storage. Use instance envs or sign in as a user account.

When this alert is present, the editor is still rendered (not disabled) in the capture.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        | +----------------------------------------------------------+ |
|        | | (x) Super admin sessions do not have per-user env storage.| |   <- my-variables only
| Side   | +----------------------------------------------------------+ |
| bar    | +----------------------------------------------------------+ |
|        | | My Variables                                              | |
|        | | Defaults for your user account. These override instance   | |
|        | | values and are overridden by thread-specific values.       | |
|        | | Resolution order: thread, user, instance, agent, then prompt.| |
|        | |----------------------------------------------------------| |
|        | | +- - - - - - - - - - - - - - - - - - - - - - - - - - - -+ | |
|        | | |  No stored variables yet.                             | | |
|        | | +- - - - - - - - - - - - - - - - - - - - - - - - - - - -+ | |
|        | | [ WEATHER_API_KEY ]  [ Value ]              [lock] [trash]| |
|        | | Add another variable                                      | |
|        | |----------------------------------------------------------| |
|        | | Secret values stay encrypted at rest...  [ Save Variables ]| |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

## Components used

- `UiButton` - `Save Variables`, `Add another variable`, lock/trash icon buttons
- `UiAlertBox` - the super-admin error banner and save feedback
- `ConfirmDialog` - row delete when the row has a value
- `CenteredContentView` - page wrapper

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/envs/instance` | Instance-scope variables (`/settings/instance-variables`) |
| PATCH | `/api/envs/instance` | Save instance-scope variables |
| GET | `/api/envs/user` | User-scope variables (`/settings/my-variables`) |
| PATCH | `/api/envs/user` | Save user-scope variables |

There is no agent/prompt/tool scope switching on this page; those scopes are edited from their own surfaces.

## Interactions

1. On mount: fetch the variables for the route's scope.
2. Rows are edited inline. The lock button toggles a row between text and secret; secret rows mask the value and become write-only.
3. `Add another variable` appends an empty row; empty-key rows are dropped on save.
4. `Save Variables` sends the full variable map to the scope's PATCH endpoint and shows `UiAlertBox` feedback.
5. Row trash asks for confirmation when the row has a value.
6. On `/settings/my-variables`, a super-admin session surfaces the red banner above the card.

## States

- Loading per scope; **empty (captured): dashed box containing exactly `No stored variables yet.`**; error with retry.
- Dirty/clean grid; saving; server-error.
- Secret values: masked display, write-only until switched back to text.
- Super-admin on `/settings/my-variables`: red `UiAlertBox` above the card.

## Theming

Every value is a token reference. Card surface `--color-background`, border `--color-border` at `--radius-xl`, dividers `--color-border`, dashed empty box `1px dashed --color-border` at `--radius-lg`, muted copy on the muted text token, key placeholder in `--font-mono`.

The error banner maps to the red semantic triple (`--alert-error-bg` / `-border` / `-text`, resolving to the red-50 / red-200 / red-600 family with dark pairs). `Save Variables` is the **inverted** primary (black on white light, white on black dark), not `--accent-600`. Secret masking is a font/opacity treatment driven by tokens. The card has **no** `box-shadow`; depth in this app comes only from `DropShadow` on overlays. All of it is themable through token overrides only.
