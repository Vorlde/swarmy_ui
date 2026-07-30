# View Spec: LoginView

- **Route:** `/login` (name: `login`)
- **Auth:** Public (`meta.public: true`). The only public route in swarmy_ui.
- **View component:** `src/views/LoginView.vue`
- **Store:** `authStore`

## Purpose

Authenticate a user against the local swarmy_ui backend and establish a session. On success, the user is redirected to the route they originally tried to visit (`?redirect=`) or to `/agents`.

## Layout

The public layout owns the screen (no sidebar, no `EditSurfaceHost`). `App.vue` renders a bare centered stage for `meta.public` routes. The stage holds a **logo lockup above** a single card - the brand mark is *not* inside the card, and the card has no title or tagline.

Measured from `login-1512-light.png` / `login-1512-dark.png` (viewport 1512, CSS px):

| Element | Measured |
|---|---|
| Stage background | `#f3f3f3`-reading page surface (light) / near-black (dark), same global grain as every other screen |
| Logo lockup | icon mark + wordmark, centered, baseline ~`80px` above the card top |
| Card | `440 x 260`, `bg #ffffff` (dark `~#171717`), `1px solid --color-border` (`#d4d4d4` / `#404040`), radius `8px`, centered both axes |
| Card elevation | **`DropShadow`**: `offsetX` / `offsetY` `6`, `pattern: "diagonal"` - the diagonal hatch is clearly visible along the card's right and bottom edges in both themes. Not a CSS `box-shadow` |
| Labels | `Username` / `Password`, bold `~13px`, `--color-text` |
| Inputs | full card content width, `~38px` tall, `1px --color-border`, radius `~6px`, transparent/white fill, placeholders `Enter your username` / `Enter your password` in `--color-neutral-400` |
| Submit | full-width `Sign in`, `~36px` tall, radius `~6px`, **black fill / white label in light, white fill / black label in dark**, label `15px/500` |

### ASCII wireframe

```
+------------------------------------------------------------------+
|  (stage background)                                              |
|                                                                  |
|                     [mark]  swarmy_ui                            |
|                                                                  |
|                +------------------------------------+#           |
|                |  Username                          |#           |
|                |  +------------------------------+  |#           |
|                |  | Enter your username          |  |#           |
|                |  +------------------------------+  |#           |
|                |                                    |#           |
|                |  Password                          |#           |
|                |  +------------------------------+  |#           |
|                |  | Enter your password          |  |#           |
|                |  +------------------------------+  |#           |
|                |  [UiAlertBox / error text, when present]        |
|                |  +------------------------------+  |#           |
|                |  |         Sign in              |  |#           |
|                |  +------------------------------+  |#           |
|                +------------------------------------+#           |
|                 ######################################           |
|                  ( # = DropShadow diagonal hatch, 6/6 )          |
+------------------------------------------------------------------+
```

Card `440x260`, vertically and horizontally centered. No navigation chrome, no "Sign in to your workspace" tagline, no logo inside the card.

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

- **Background:** `bg-background` on the stage; the card uses `--color-background` with `--color-border` and the `--radius-*` scale. A theme can make the stage a gradient or image by editing the semantic background tokens (or a `.login-stage` hook class) without touching the view.
- **Brand mark:** the logo/wordmark sits above the card and reads its own brand tokens. It is *not* accent-tinted in the capture, so rebranding the accent does not recolor it.
- **Card chrome:** radius and padding come from the primitives' component tokens. **Elevation is not a shadow scale** - the card is wrapped in `DropShadow` (`offsetX`/`offsetY` `6`, `pattern: "diagonal"`, ink from `--dropshadow-color`), so a flatter theme sets `elevation="none"` rather than shrinking a blur radius.
- **Submit button:** the inverted primary token pair (`--color-neutral-950` fill / white label in light, mirrored in dark), *not* `--accent-600`. Changing the accent ramp must not change the `Sign in` button.
- **Dark mode:** follows the `.dark` class strategy like every other view; no view-specific dark code. Light -> dark inverts the card surface, the input borders, and the submit fill/label; the hatch shadow re-renders in the dark ink token.
- **Full reskin:** a different login presentation (split screen, hero panel, SSO-only buttons) is a rewrite of `LoginView.vue`'s template only, keeping the `authStore.login` call and redirect logic intact.

## Notes

- Never hardcode credentials or prefill the form.
- The token is stored client-side and also sent as a session cookie by the backend; the API client sends it as a Bearer token and as the `?token=` query param on WebSocket upgrades.
- The `?redirect=` contract is owned by the router guard, not the view; the view only consumes it.
