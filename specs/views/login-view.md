# View Spec: LoginView

- **Route:** `/login` (name: `login`)
- **Auth:** Public (`meta.public: true`). The only public route in swarmy_ui.
- **View component:** `src/views/LoginView.vue`
- **Store:** `authStore`

## Purpose

Authenticate a user against the local swarmy_ui backend and establish a session. On success, the user is redirected to the route they originally tried to visit (`?redirect=`) or to `/agents`.

## Layout

The public layout owns the screen (no sidebar, no `EditSurfaceHost`). `App.vue` renders a bare centered stage for `meta.public` routes. The view itself is a single centered card on the app background.

### ASCII wireframe

```
+------------------------------------------------------------------+
|  (app background: bg-background)                                 |
|                                                                  |
|                +------------------------------------+            |
|                |  [logo mark]                       |            |
|                |  swarmy_ui                         |            |
|                |  Sign in to your workspace         |            |
|                |                                    |            |
|                |  Username                          |            |
|                |  +------------------------------+  |            |
|                |  | admin                        |  |            |
|                |  +------------------------------+  |            |
|                |                                    |            |
|                |  Password                          |            |
|                |  +------------------------------+  |            |
|                |  | ********                     |  |            |
|                |  +------------------------------+  |            |
|                |  [error text, when present]        |            |
|                |                                    |            |
|                |  +------------------------------+  |            |
|                |  |         Sign in              |  |            |
|                |  +------------------------------+  |            |
|                +------------------------------------+            |
|                                                                  |
+------------------------------------------------------------------+
```

Card width ~360px, vertically and horizontally centered. No navigation chrome.

## Components used

- `UiFormField` - label + control + help/error wrapper for both inputs
- `UiLabel`, `UiErrorText` - via `UiFormField`
- `TextInput` - username and password fields (password uses `type="password"`)
- `UiButton` (`variant="primary"`, block) - submit
- `UiAlertBox` - top-of-card error banner for server-side failures (wrong credentials, server unreachable)
- `Loader` - inline spinner state on the submit button while the request is in flight

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/auth/config` | On mount | Returns the auth configuration (auth type, whether login is required, branding hints). Drives which form fields are shown. |
| `POST /api/auth/login` | On submit | Body: `{ username?: string, password: string }`. 200 returns `{ token, user: { id, username, role } }` and sets the session cookie. |
| `GET /api/auth/me` | Indirect | Called by `authStore.checkSession()` in the router guard after redirect, not by this view directly. |

No other endpoints are touched. The view does not load agents, threads, or config data.

## User interactions

1. **Type username / password.** Standard controlled inputs. Enter key in either field submits.
2. **Submit.** `authStore.login(username, password)` -> `POST /api/auth/login`.
3. **Success.** Store the token in `authStore` (persisted to localStorage so a refresh keeps the session), then `router.push(route.query.redirect ?? { name: "agents" })`.
4. **Failure (401).** Show "Invalid username or password" in the `UiAlertBox` and `UiErrorText` on the password field. Do not clear the username; do clear the password.
5. **Failure (network/5xx).** Show a generic "Could not reach the server" alert; keep both fields.
6. **Already authenticated.** The router guard redirects `/login` -> `/agents` before this view mounts, so a logged-in user never sees it.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Idle** | Initial mount (after `/api/auth/config` resolves) | Form enabled, submit enabled |
| **Config loading** | Mount, config request in flight | Form skeleton / disabled inputs, spinner in card |
| **Submitting** | Submit clicked | Inputs and button disabled, spinner inside `UiButton` |
| **Auth error** | 401 from login | `UiAlertBox` + inline `UiErrorText`, password cleared, focus to password |
| **Server error** | Non-401 failure | `UiAlertBox` with retry hint |
| **Redirecting** | 200 received | Brief disabled state while `router.push` resolves |
| **Authed** | Guard detects valid session | View never rendered |

There is no empty state (no lists) and no auth-wall state (this view IS the auth wall).

## Theming

The login card is pure skin: it composes only `Ui*` primitives and semantic token utilities.

- **Background:** `bg-background` on the stage; the card uses `bg-background-soft` with `border-border` and the `--radius-*` scale. A theme can make the stage a gradient or image by editing the semantic background tokens (or a `.login-stage` hook class) without touching the view.
- **Brand mark:** the logo/wordmark reads `--accent-*`. Rebranding the accent recolors the mark and the primary `Sign in` button in one edit.
- **Card chrome:** shadow, radius, and padding come from the primitives' component tokens; a denser or flatter theme adjusts `--radius-*` and the shadow scale globally.
- **Dark mode:** follows the `.dark` class strategy like every other view; no view-specific dark code.
- **Full reskin:** a different login presentation (split screen, hero panel, SSO-only buttons) is a rewrite of `LoginView.vue`'s template only, keeping the `authStore.login` call and redirect logic intact.

## Notes

- Never hardcode credentials or prefill the form.
- The token is stored client-side and also sent as a session cookie by the backend; the API client sends it as a Bearer token and as the `?token=` query param on WebSocket upgrades.
- The `?redirect=` contract is owned by the router guard, not the view; the view only consumes it.
