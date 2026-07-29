# Component Spec: Sidebar

## Purpose

Primary app navigation rail. Hosts the logo, top-level nav sections (Agents, Marketplace, Models, Providers), the current-agent selector with section shortcuts (Threads, Structure), a docs link, theme toggle, and the user/logout section. Collapses to an icon rail.

## Props

```ts
defineProps<{
  isCollapsed: boolean;   // icon-rail mode (w-16) vs expanded (w-60)
  isDark: boolean;        // current theme, used for logo variant and toggle state
}>();
```

## Emits

- `toggle-sidebar()` - collapse/expand button clicked
- `toggle-theme()` - light/dark switch requested
- `navigate(path: string)` - emitted before router push; useful for analytics
- `logout()` - user confirmed logout

## Slots

- `logo` - overrides the default logo image pair (light/dark)
- `footer` - extra content above the user section

## Behavior

- Nav items are driven by a static config array (`{ id, label, icon, path }`); an item is active when the route equals or is nested under its path. Active items show an accent icon and a filled surface.
- Badge counts (agent count, marketplace/models/providers counts, thread count) render next to labels when provided by the nav store; hidden when collapsed.
- Re-clicking the active route clears the route hash or smooth-scrolls the composition canvas back to the start instead of re-navigating.
- Collapsed mode: labels hide, items become icon-only with `title` tooltips, and the agent selector becomes an avatar button that opens a teleported dropdown listing agents with icon, label, description, and thread count. The dropdown closes on outside click and on sidebar expand.
- Section shortcuts (Threads, Structure) scroll the composition canvas to the target section and highlight with an accent left border when active. A cascade entrance animation staggers items via a `--cascade-index` CSS variable.
- The user section hosts the settings menu, theme toggle, and logout. Logout calls `POST /api/auth/logout` (hosted mode: GET redirect with `return_to`), clears local session state, and routes to `/login`.
- Width animates between `w-16` and `w-60` with a 300ms transition.

## States

- **Loading**: agent selector shows its loading indicator while agent options fetch.
- **Empty**: no agents available; the selector is hidden and the Agents badge shows 0.
- **Error**: logout fetch failure is swallowed and local logout proceeds anyway.
- **Disabled**: nav to unavailable sections can be flagged in the config; disabled items render dimmed and non-interactive.

## Theming / Swappability

The rail surface, dividers, and hover fills use paired light/dark alpha tokens (`--sidebar-hover-bg`, `--sidebar-active-bg`) which default to black/white alpha overlays. The active accent (icon tint, section left border) resolves through `--accent-500`/`--accent-400`. Widths are `--sidebar-width` / `--sidebar-width-collapsed`, radius `--radius-lg`, and the logo is injected via the `logo` slot or `--logo-url-light` / `--logo-url-dark` tokens, so a full rebrand (logo, widths, colors) happens without touching component logic. The cascade stagger duration is `--sidebar-cascade-delay`.

## API Endpoints

- `GET /api/auth/config` - decides hosted vs self-hosted logout flow
- `POST /api/auth/logout` - self-hosted logout
- `GET /api/auth/logout?return_to=%2F` - hosted logout redirect
- Agent options and counts come from the agents store (backed by `GET /api/agents`); the sidebar itself does not fetch them.

## Wireframe

Expanded mode (`--sidebar-width`, w-60):

```
+-----------------------------+
| [logo]  swarmy_ui           |
|-----------------------------|
| AGENTS                      |
|  [>] fraud_review_agent  v  |  <- agent selector
|      - Threads              |  <- section shortcuts
|      - Structure            |
|-----------------------------|
| NAV                         |
|  [ic] Agents          (12)  |  <- badge counts
|  [ic] Marketplace      (4)  |
|  [ic] Models           (31) |
|  [ic] Providers         (6) |
|-----------------------------|
|  [docs] Documentation       |
|-----------------------------|
|  [<] collapse   [sun/moon]  |  <- toggle-sidebar + theme
|-----------------------------|
|  [avatar] jane@acme.io      |
|           [settings] [out]  |  <- settings flyout + logout
+-----------------------------+
```

Collapsed mode (`--sidebar-width-collapsed`, w-16, icon rail):

```
+------+
| [lg] |
|------|
| [av] |  <- agent avatar; click opens teleported dropdown
|------|
| [ic] |  <- icon-only items, title tooltips
| [ic] |
| [ic] |
| [ic] |
|------|
| [>]  |  <- expand
| [tm] |  <- theme toggle
|------|
| [us] |  <- user avatar; settings + logout via flyout
+------+

Agent dropdown (teleported, collapsed mode only):
+------------------------------+
| o fraud_review_agent   (3 t) |
| o inventory_check      (1 t) |
| o order_support       (12 t) |
+------------------------------+
```

Badges hide when collapsed. Active item shows accent icon tint and filled surface; active section shortcut shows an accent left border.
