# Component Spec: Sidebar

## Purpose

Primary app navigation rail. Hosts the logo, top-level nav sections (Agents, Marketplace, Models, Providers), the current-agent selector with its cascade shortcuts (Threads, Structure), a docs link, and the settings/logout footer. Collapses to an icon rail.

Verified against `agents-cascade-fullwidth-3500-light.png`, `sidebar-collapsed-light.png`, `settings-gear-popover-{light,dark}.png` and `agent-context-switcher-popover-light.png`.

Measured geometry (`exact-tokens.md` 3.1):

| | Value |
|---|---|
| `aside` expanded | `w-60` = **240px** |
| `aside` collapsed | `w-16` = **64px** |
| `aside` background | **transparent** - it shows the page background (`.app-container` `bg-neutral-50/80`), it is not its own surface |
| `aside` padding | `10px 0 0` (`pt-2.5`) |
| `aside` transition | `all .3s cubic-bezier(.4,0,.2,1)` |
| Nav item | height 40px, width 224px, `padding 10px 12px`, `radius 8px`, `gap 12px`, `font-size 14px` |
| Nav item active | `bg-black/[0.06]` + `font-semibold` (600) |
| Nav item idle | transparent + weight 400, `hover:bg-black/5` |
| Count badge | `text-[11px] font-mono text-neutral-400` (`#a1a1a1`) |

There is **no** user avatar / email row and **no** inline theme toggle in the rail. The footer is exactly two icon buttons: a gear (left) that opens the settings popover, and a logout icon (right). Theme and accent live inside that popover.

## Props

```ts
defineProps<{
  isCollapsed: boolean;   // icon-rail mode (w-16) vs expanded (w-60)
  isDark: boolean;        // current theme, used for logo variant and toggle state
}>();
```

## Emits

- `toggle-sidebar()` - collapse/expand chevron clicked (the chevron sits next to the logo, not in the footer)
- `toggle-theme()` - light/dark switch requested (raised by the settings popover, forwarded)
- `set-accent(name: string)` - one of the 10 accent swatches picked; writes `data-accent` on `<html>`
- `navigate(path: string)` - emitted before router push; useful for analytics
- `logout()` - user confirmed logout

## Slots

- `logo` - overrides the default logo image pair (light/dark)
- `footer` - extra content above the user section

## Behavior

- Nav items are driven by a config array (`{ id, label, icon, path, badge? }`). **This array is the sidebar's plug point** (ADR-008): core renders whatever is in it, so a feature adds a rail entry from its own plug rather than by editing this component. An item is active when the route equals or is nested under its path.
- Live item order, top to bottom: `Agents` (count) -> agent context pill -> cascade items (`Threads`, `Structure`) -> divider -> `Marketplace`, `Models` (count), `Providers` (count), `Docs` (external, opens in a new tab, trailing external-link glyph, no count) -> footer (gear, logout). Counts observed: Agents 3, Threads 2, Models 1, Providers 2; `Structure` carries the agent *type* (`AI+Human`) in the count slot, not a number.
- Active items use a filled surface (`bg-black/[0.06]`) and semibold text, **not** an accent tint. The accent appears on the active cascade item's left border and on the agent pill avatar.
- Badge counts (agent count, marketplace/models/providers counts, thread count) render next to labels when provided by the nav store; hidden when collapsed.
- Re-clicking the active route clears the route hash or smooth-scrolls the composition canvas back to the start instead of re-navigating.
- Collapsed mode: labels hide, items become icon-only with `title` tooltips, and the agent selector becomes an avatar button that opens a teleported dropdown listing agents with icon, label, description, and thread count. The dropdown closes on outside click and on sidebar expand.
- Cascade shortcuts (`Threads`, `Structure`) exist only while an agent is selected. They scroll `.composition-scroll-container` to the matching snap section and highlight with an accent left border when active. They mount with `sidebar-cascade-in` (`0% {opacity:0; translateY(-4px)}` -> `100%`, `.2s ease-out both`), staggered via a `--cascade-index` CSS variable.
- **Settings popover (gear).** Opens `absolute bottom-full mb-2 left-0 z-50` above the gear; positioner 206x350, card 200x344, `bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg min-w-[200px] overflow-hidden`. Contents in order: `Appearance` section header + a sun/moon pill toggle (track `h-7 rounded-full bg-neutral-200`, 64x28; knob `32x24 rounded-full bg-white dark:bg-black shadow-sm`); `Accent Color` header + 10 swatches (`w-6 h-6 rounded-full ring-1 ring-black/10` in `grid grid-cols-5 gap-3`, DOM order amber, lime, emerald, sky, blue, indigo, purple *(default)*, fuchsia, pink, white); then menu items `My Variables`, `Instance Variables`, `Users`, `API Keys` (`flex items-center gap-3 px-4 py-2 text-sm hover:bg-black/5`, 198x36). Section headers are `px-4 py-3 border-b border-neutral-200`, label `text-xs font-bold text-neutral-600`.
- **Popover behaviour, exactly as captured:** popovers have no CSS enter/leave transition - they appear instantly. Escape does **not** close the settings popover; only an outside click does. Depth comes from `DropShadow` (canvas hatch, 6px right/bottom), never `box-shadow`.
- **Agent context switcher.** Clicking the agent pill under `Agents` opens a combobox popover with a search field and one row per agent: avatar, name, type sublabel, thread count, and a checkmark on the active one. Same popover chrome and hatch shadow.
- The footer hosts the gear and the logout button. Logout calls `POST /api/auth/logout` (hosted mode: GET redirect with `return_to`), clears local session state, and routes to `/login`.
- Width animates between `w-16` (64px) and `w-60` (240px) over 300ms.

## States

- **Loading**: agent selector shows its loading indicator while agent options fetch.
- **Empty**: no agents available; the selector is hidden and the Agents badge shows 0.
- **Error**: logout fetch failure is swallowed and local logout proceeds anyway.
- **Disabled**: nav to unavailable sections can be flagged in the config; disabled items render dimmed and non-interactive.

## Theming / Swappability

The rail itself has no background - it inherits the page surface, so a page-background token change re-skins it for free. Dividers and hover/active fills use paired light/dark alpha tokens (`--sidebar-hover-bg` = `black/5`, `--sidebar-active-bg` = `black/[0.06]`) which default to black/white alpha overlays. The active accent (icon tint, section left border) resolves through `--accent-500`/`--accent-400`. Widths are `--sidebar-width` / `--sidebar-width-collapsed`, radius `--radius-lg`, and the logo is injected via the `logo` slot or `--logo-url-light` / `--logo-url-dark` tokens, so a full rebrand (logo, widths, colors) happens without touching component logic. The cascade stagger duration is `--sidebar-cascade-delay`.

## API Endpoints

- `GET /api/auth/config` - decides hosted vs self-hosted logout flow
- `POST /api/auth/logout` - self-hosted logout
- `GET /api/auth/logout?return_to=%2F` - hosted logout redirect
- Agent options and counts come from the agents store (backed by `GET /api/agents`); the sidebar itself does not fetch them.

## Wireframe

Expanded (`--sidebar-width`, 240px). Transcribed from `agents-cascade-fullwidth-3500-light.png`:

```
+-----------------------------+
| (mark) swarmy_ui        [<] |  <- logo + collapse chevron
|                             |
| [robot] Agents           3  |  <- nav item, ACTIVE (bg-black/[0.06], 600)
| [av] order_support_agent  v |  <- agent context pill -> combobox popover
|                             |
| | [~] Threads           2   |  <- cascade item, accent left border when active
|   [oo] Structure   AI+Human |  <- count slot carries the agent type
|- - - - - - - - - - - - - - -|
| [shop] Marketplace          |
| [chip] Models            1  |
| [db]   Providers         2  |
| [book] Docs              [^]|  <- external link glyph
|                             |
|                             |
|-----------------------------|
| [gear]               [exit] |  <- settings popover + logout
+-----------------------------+
```

Collapsed (`--sidebar-width-collapsed`, 64px, `sidebar-collapsed-light.png`): logo mark only, then the same items as centred icons with `title` tooltips and **no counts, no labels, no agent name** - the agent pill becomes its avatar. Dividers and the gear/logout footer are unchanged.

Settings popover (`settings-gear-popover-light.png`), anchored `bottom-full mb-2 left-0`:

```
+---------------------------+
| Appearance                |   <- px-4 py-3, border-b, text-xs font-bold
|  ( [sun] [moon] )         |   <- 64x28 track, 32x24 knob (only shadow-sm in the app)
|---------------------------|
| Accent Color              |
|  o o o o o                |   <- amber lime emerald sky blue
|  o (o) o o o              |   <- indigo purple(active, ring) fuchsia pink white
|---------------------------|
| [person]  My Variables    |
| [org]     Instance Vars   |
| [people]  Users           |
| [key]     API Keys        |
+---------------------------+
        \\\  <- DropShadow hatch, 6px right + 6px bottom
```

Agent context switcher (opened from the agent pill):

```
+----------------------------------+
| [search agents...              ] |
| [av] fraud_review_agent   2  ( ) |
| [av] inventory_check_ag.. 3  ( ) |
| [av] order_support_agent  2  (v) |  <- checkmark on active
+----------------------------------+
```

Badges hide when collapsed. The active nav item shows a filled neutral surface and semibold text; the active cascade item shows an accent left border.
