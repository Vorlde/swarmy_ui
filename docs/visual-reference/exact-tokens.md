# exact-tokens.md - AgentBuilder Admin UI

Extracted live from `http://localhost:5173` on 2026-07-30 via Playwright `page.evaluate` +
Chrome extension `javascript_tool`. Every value below is a **computed** value read from the
running app (`getComputedStyle` / stylesheet rule enumeration), not inferred from source.

Method:
- CSS custom properties: iterated `document.styleSheets` -> `CSSStyleRule.style` for every
  `--*` declaration (2466 declarations found), then resolved each name through
  `getComputedStyle(document.documentElement)` (1544 resolve on `:root`).
- Element values: `getComputedStyle(el)` on the live deep-link page
  `/agents?agent=order_support_agent&thread=4ae6b87e-9270-442a-9977-91b448ef73ea`.
- `oklab()` / `oklch()` / `color-mix()` values were resolved to sRGB hex through a
  `CanvasRenderingContext2D.fillStyle` round-trip (exact browser conversion).

---

## 1. Root / document

| Element | Property | Light | Dark |
|---|---|---|---|
| `<html>` | `font-size` | `16px` | same |
| `<html>` | `font-family` | `"Public Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` | same |
| `<html>` | class | *(no class)* | `dark` |
| `<body>` | class | `enable-motion underline-links` | same |
| `<body>` | `background-color` | `rgb(255,255,255)` `#ffffff` | `rgb(24,24,24)` `#181818` |
| `<body>` | `color` | `rgb(10,10,10)` `#0a0a0a` | `rgba(235,235,235,0.64)` |
| `<body>` | `font-size` | **`15px`** | same |
| `<body>` | `line-height` | `24px` | same |
| `<body>` | `transition` | `color .5s, background-color .5s` | same |
| `<body>` | `font-family` | `"Public Sans", -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif` | same |

**Note the two different sans stacks.** `body` uses the legacy Vue-scaffold stack; every element
inside `.app-container` inherits `font-sans` = the `--font-sans` stack (Public Sans first in both).

Theme switching is `class="dark"` on `<html>`. Accent switching is `data-accent="<name>"` on
`<html>` (absent = default purple).

---

## 2. Design-token custom properties (`:root`)

### 2.1 Accent ramp (default = purple, `:root` with no `data-accent`)

| Var | Value |
|---|---|
| `--accent-50` | `#faf5ff` |
| `--accent-100` | `#f3e8ff` |
| `--accent-200` | `#e9d5ff` |
| `--accent-300` | `#d8b4fe` |
| `--accent-400` | `#c084fc` |
| `--accent-500` | `#a855f7` |
| `--accent-600` | `#9333ea` |
| `--accent-700` | `#7e22ce` |
| `--accent-800` | `#6b21a8` |
| `--accent-900` | `#581c87` |
| `--accent-950` | `#3b0764` |

`--color-accent-N` is an alias: `--color-accent-N: var(--accent-N)`.

**Alternate accent ramps** are declared as `:root[data-accent="<name>"]`. Full set found
(10 swatches in the gear popover, in DOM order): `amber, lime, emerald, sky, blue` /
`indigo, purple(default), fuchsia, pink, white`.

| data-accent | 500 | 600 | 700 |
|---|---|---|---|
| *(none / purple)* | `#a855f7` | `#9333ea` | `#7e22ce` |
| `amber` | `#c27314` | `#9f5612` | `#7e4212` |
| `lime` | `#70a927` | `#568720` | `#456b20` |
| `emerald` | `#299463` | `#22774f` | `#205f42` |
| `sky` | `#188bb8` | `#167196` | `#195b78` |
| `blue` | `#3b82f6` | `#2563eb` | `#1d4ed8` |
| `indigo` | `#6366f1` | `#4f46e5` | `#4338ca` |
| `fuchsia` | `#d946ef` | `#c026d3` | `#a21caf` |
| `pink` | `#ec4899` | `#db2777` | `#be185d` |
| `white` | `#71717a` | `#52525b` | `#3f3f46` |

### 2.2 Agent-composition accent layer (`--agents-accent-*`)

Declared twice: a plain fallback, then a `@supports (color: color-mix(in lab, red, red))`
override that is what actually applies in Chrome.

| Var | Light declaration | Light resolved | Dark declaration | Dark resolved |
|---|---|---|---|---|
| `--agents-accent-surface-hover` | `color-mix(in oklab, var(--accent-500) 8%, #fff)` | `#f8f2ff` | `color-mix(in oklab, var(--accent-500) 14%, #0a0a0a)` | `#1c1525` |
| `--agents-accent-surface-selected` | `color-mix(in oklab, var(--accent-500) 18%, #fff)` | **`#efe3ff`** | `color-mix(in oklab, var(--accent-500) 28%, #0a0a0a)` | **`#302043`** |
| `--agents-accent-surface-strong` | `color-mix(in oklab, var(--accent-500) 26%, #fff)` | `#e7d6ff` | `color-mix(in oklab, var(--accent-500) 36%, #0a0a0a)` | `#3c2655` |
| `--agents-accent-surface-message` | `color-mix(in oklab, var(--accent-500) 18%, #fff)` | `#efe3ff` | `color-mix(in oklab, var(--accent-500) 28%, #0a0a0a)` | `#302043` |
| `--agents-accent-text` | `#171717` | `#171717` | `#fafafa` | `#fafafa` |
| `--agents-accent-text-muted` | `color-mix(in oklab, var(--accent-700) 78%, #171717)` | **`#6527a2`** | `color-mix(in oklab, var(--accent-200) 72%, #fafafa)` | `#eedffe` |
| `--agents-accent-border` | `var(--accent-600)` | `#9333ea` | `var(--accent-400)` | `#c084fc` |
| `--agents-accent-ring` | `var(--accent-500)` | `#a855f7` | `var(--accent-400)` | `#c084fc` |

Utility classes that consume them (verified via live rule dump):

```
.agents-surface-hover:hover      { background-color: var(--agents-accent-surface-hover) }
.agents-surface-selected         { background-color: var(--agents-accent-surface-selected) }
.agents-surface-selected-strong  { background-color: var(--agents-accent-surface-strong) }
.agents-surface-selected-crisp   { box-shadow: inset 0 1px color-mix(in oklab,var(--agents-accent-border) 34%,transparent),
                                               inset 0 -1px color-mix(in oklab,var(--agents-accent-border) 34%,transparent) }
.agents-text-selected            { color: var(--agents-accent-text) }
.agents-text-selected-muted      { color: var(--agents-accent-text-muted) }
.agents-border-selected          { border-color: var(--agents-accent-border) }
.agents-ring-selected            { --tw-ring-color: var(--agents-accent-ring) }
```

### 2.3 Vue-scaffold semantic vars

| Var | Light | Dark |
|---|---|---|
| `--vt-c-white` / `-soft` / `-mute` | `#fff` / `#f8f8f8` / `#f2f2f2` | - |
| `--vt-c-black` / `-soft` / `-mute` / `-pure` | `#181818` / `#222` / `#282828` / `#0a0a0a` | - |
| `--vt-c-divider-light-1/-2` | `#3c3c3c4a` / `#3c3c3c1f` | - |
| `--vt-c-divider-dark-1/-2` | `#545454a6` / `#5454547a` | - |
| `--color-background` | `#fff` | `#181818` |
| `--color-background-soft` | `#f8f8f8` | `#222` |
| `--color-background-mute` | `#f2f2f2` | `#282828` |
| `--color-border` | **`#d4d4d4`** | **`#404040`** |
| `--color-border-hover` | `#a3a3a3` | `#737373` |
| `--color-heading` | `#0a0a0a` | `#fff` |
| `--color-text` | `#0a0a0a` | `#ebebeba3` |
| `--section-gap` | `160px` | same |

### 2.4 Typography / geometry / motion tokens

| Var | Value |
|---|---|
| `--font-sans` | `"Public Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |
| `--font-weight-normal / medium / semibold / bold` | `400 / 500 / 600 / 700` |
| `--text-xs` / line-height | `.75rem` / `calc(1/.75)` |
| `--text-sm` / lh | `.875rem` / `calc(1.25/.875)` |
| `--text-base` / lh | `1rem` / `1.5` |
| `--text-lg` / lh | `1.125rem` / `calc(1.75/1.125)` |
| `--text-xl` / lh | `1.25rem` / `calc(1.75/1.25)` |
| `--text-2xl` / lh | `1.5rem` / `calc(2/1.5)` |
| `--text-3xl` / lh | `1.875rem` / `1.2` |
| `--leading-tight / relaxed` | `1.25` / `1.625` |
| `--tracking-tighter/tight/normal/wide/wider` | `-.05em / -.025em / 0em / .025em / .05em` |
| `--radius-xs / sm / md / lg / xl / 2xl` | `.125 / .25 / .375 / .5 / .75 / 1` rem |
| `--spacing` | `.25rem` |
| `--blur-sm` | `8px` |
| `--default-transition-duration` | `.15s` |
| `--default-transition-timing-function` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-in / out / in-out` | `cubic-bezier(.4,0,1,1)` / `cubic-bezier(0,0,.2,1)` / `cubic-bezier(.4,0,.2,1)` |
| `--animate-pulse` | `pulse 2s cubic-bezier(.4,0,.6,1) infinite` |
| `--animate-spin` | `spin 1s linear infinite` |

### 2.5 Neutral ramp (used for nearly all chrome) - oklch source and exact hex

| Token | oklch | hex |
|---|---|---|
| `--color-neutral-50` | `oklch(98.5% 0 0)` | `#fafafa` |
| `--color-neutral-100` | `oklch(97% 0 0)` | `#f5f5f5` |
| `--color-neutral-200` | `oklch(92.2% 0 0)` | `#e5e5e5` |
| `--color-neutral-300` | `oklch(87% 0 0)` | `#d4d4d4` |
| `--color-neutral-400` | `oklch(70.8% 0 0)` | `#a1a1a1` |
| `--color-neutral-500` | `oklch(55.6% 0 0)` | `#737373` |
| `--color-neutral-600` | `oklch(43.9% 0 0)` | `#525252` |
| `--color-neutral-700` | `oklch(37.1% 0 0)` | `#404040` |
| `--color-neutral-800` | `oklch(26.9% 0 0)` | `#262626` |
| `--color-neutral-900` | `oklch(20.5% 0 0)` | `#171717` |
| `--color-neutral-950` | `oklch(14.5% 0 0)` | `#0a0a0a` |

Status colors actually rendered: `green-500 = #00c950` (live dot, light), `green-400 = #05df72`
(dark), `red-500 = #fb2c36`, `red-600 = #e7000b` (Delete Thread text), `red-400 = #ff6467` (dark),
`amber-500 = #fe9a00`, `emerald-700 = oklch(50.8% .118 165.612)` (Success pill text).

Also present in `:root`: ~1300 `--vscode-icon-*` codicon vars and `--vscode-sash-size: 4px`
(Monaco editor is bundled).

---

## 3. Computed values for key elements (light, viewport 1512x850 / 2600x1000)

### 3.1 Shell

| Element | Selector / classes | Computed |
|---|---|---|
| Page background | `.app-container` = `relative flex h-screen font-sans bg-neutral-50/80 text-black dark:bg-black dark:text-white` | light `oklab(.985 0 0 / .8)` = **`#fafafa` @ 80% over white**; dark `rgb(0,0,0)` `#000` |
| Sidebar | `aside.flex.flex-col.transition-all.duration-300.pt-2.5.w-60` | **width `240px`**, `background: transparent` (shows page bg), `padding: 10px 0 0`, `transition: .3s cubic-bezier(.4,0,.2,1)` |
| Sidebar collapsed | same `aside`, `w-16` | `64px` (see `sidebar-collapsed-light.png`) |
| Main panel | `main.flex-1.overflow-auto.my-3.flex.flex-col.rounded-l-xl.border-l.border-neutral-200` | `border-left: 1px solid #d4d4d4` (dark `#404040`), `border-radius: 12px 0 0 12px`, `margin: 12px 0` |
| Sidebar nav item ACTIVE | `bg-black/[0.06] font-semibold` | bg `oklab(0 0 0/.06)`, `font-size 14px / weight 600`, `padding 10px 12px`, `radius 8px`, `gap 12px`, height `40px`, width `224px` |
| Sidebar nav item idle | `hover:bg-black/5` | transparent, weight 400 |
| Sidebar count badge | `text-[11px] font-mono text-neutral-400` | `11px`, `#a1a1a1` |

### 3.2 Cascade columns

| Element | Computed |
|---|---|
| `.composition-scroll-container` | `overflow-x:auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth` |
| flex track | `display:flex; gap: 12px; height: 100%` |
| `.snap-section` shell | `rounded-xl overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900` -> `border 1px solid #d4d4d4`, `border-radius 12px`, `background #ffffff` |
| section widths @1512 vp | `[offsetLeft, width]` = `[-1, 782]`, `[793, 1143]`, `[1948, 1223]`; scrollWidth `3171`, clientWidth `1271` |
| `.threads-col` | `width 280px; min-width 280px; transition: width .2s cubic-bezier(.4,0,.2,1), min-width .2s ...` (collapsed variant `48px`) |
| Column header bar | `px-4 py-3 border-b border-neutral-200` -> `padding 12px 16px`, `border-bottom 1px solid #d4d4d4` |
| Column title `h2` | `text-base font-bold` -> `16px / 700 / lh 24px`, color `#000` |
| Column count span | `text-xs font-mono text-neutral-500` -> `12px`, `#737373` |

### 3.3 Agents list (a CSS **grid**, not a `<table>`)

Grid template: `grid-cols-[36px_1fr_72px_80px_1fr_32px]`, `gap-x-4` (`16px`).

| Element | Classes | Computed |
|---|---|---|
| Header row | `... border-b border-neutral-200 px-5 py-2 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500` | **`font-size 11px`, `font-weight 600`, `letter-spacing: normal` (NOT tracked), `text-transform: none` (NOT uppercase)**, color `#a1a1a1`, `padding 8px 20px`, `border-bottom 1px solid #d4d4d4`, height `35px` |
| Header sort button | `flex items-center gap-1 text-left` | `gap 4px`, inherits 11px/600/`#a1a1a1` |
| Row idle | `grid w-full cursor-pointer ... px-5 py-3 text-[13px] transition-colors agents-surface-hover` | `font-size 13px`, `lh 20.8px`, `padding 12px 20px`, height `66px`, bg transparent; hover -> `#f8f2ff` |
| Row SELECTED | `... agents-surface-selected agents-border-selected` | bg **`#efe3ff`** (dark `#302043`), `border-color: #9333ea` (dark `#c084fc`) |
| Row title span | `truncate font-medium text-neutral-900` | `13px / 500`, `#171717` |
| Row avatar | `img.h-9.w-9.rounded-md.object-cover` | `36x36`, radius `6px` |
| Type cell idle | `text-neutral-500` | `#737373` |
| Type cell SELECTED | `agents-text-selected-muted` | **`#6527a2`** (dark `#eedffe`) |
| Row transition | `color/background-color/border-color/... .15s cubic-bezier(.4,0,.2,1)` |

### 3.4 Controls

| Element | Computed |
|---|---|
| Search box (`label`) | `border 1px solid #d4d4d4`, `radius 8px`, `bg #ffffff`, `padding 6px 12px`, `gap 8px`, height `34px`, `font-size 14px` |
| Search input | transparent, `14px`, placeholder `text-neutral-400` `#a1a1a1` |
| Segmented group | `border 1px solid #d4d4d4`, `radius 6px`, `font-size 11px`, height `32px` |
| Segmented ACTIVE (`All`) | `bg-neutral-900` `#171717`, `color #fff`, `padding 6px 10px`, `font-weight 500` |
| Segmented idle | transparent, `#737373` |
| `New Agent` button | `bg #171717`, `color #fff`, `radius 6px`, `padding 6px 12px`, `font 11px/500`, `gap 4px`, `99x30` |
| `Copy cURL` button | `bg #171717`, `#fff`, `radius 4px`, `padding 4px 12px`, `12px/500` |
| Cost chip | `bg-neutral-100` `#f5f5f5`, `color #525252`, `radius 6px`, `h 32px`, `padding 0 8px`, `12px/500`, `gap 6px` |
| Status pill (`Success`) | `rounded-full`, `border 1px solid #d4d4d4`, `bg #fff`, `padding 2px 8px`, `font 11px/500`, `gap 6px`, text `oklch(50.8% .118 165.612)` (emerald-700) |
| Live status dot | `w-2 h-2 rounded-full bg-green-500 dark:bg-green-400` -> `8x8`, `#00c950` / `#05df72` |

### 3.5 Threads column / messages / inspector

| Element | Computed |
|---|---|
| Thread item SELECTED | `rounded-lg px-3 py-2 agents-surface-selected` -> bg `#efe3ff`, `radius 8px`, `padding 8px 12px`, `264x47`, `font-size 12px` |
| Thread item idle | `agents-surface-hover`, transparent |
| Sub-agent group button | `w-full rounded-lg text-left px-3 py-1.5 bg-neutral-50/25 dark:bg-neutral-900/10` |
| User message bubble | `message-text-surface agents-surface-message agents-text-selected rounded-2xl px-4 py-2.5 text-[15px] leading-7 min-h-[2.5rem]` -> bg `#efe3ff`, color `#171717`, `radius 16px`, `padding 10px 16px`, `15px / lh 28px` |
| Inspector tab ACTIVE | `relative z-10 ... h-8 rounded-md px-2.5 text-sm font-medium text-white` -> `14px/500`, `#fff` on a separately-animated `#171717` pill behind it, `h 32px`, `padding 0 10px`, `gap 6px`, `radius 6px` |
| Inspector tab idle | `text-neutral-500` `#737373` |
| Log detail panel root | `.log-details-root h-full overflow-y-auto bg-white p-3 dark:bg-neutral-900` -> `padding 12px`, `bg #ffffff` |
| Log detail stat-tile value | `16px / 600`, `#171717` |
| Log table `th` | `px-4 py-2 font-medium` -> **`font-size 10px`, `font-weight 500`, `letter-spacing 0.25px`, `text-transform: uppercase`**, `color #737373`, `padding 8px 16px` |
| Log table `td` | `whitespace-nowrap px-4 py-2 align-middle` -> `12px`, `padding 8px 16px` |
| Log table row SELECTED | `agents-surface-selected` -> `#efe3ff` |

### 3.6 Popovers / overlays

| Element | Computed |
|---|---|
| Gear popover positioner | `absolute bottom-full mb-2 left-0 z-50`, `206x350` |
| Popover card | `bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg min-w-[200px] overflow-hidden` -> `border 1px solid #d4d4d4`, `radius 8px`, `200x344` |
| **Popover shadow** | NOT a CSS `box-shadow`. A sibling `<canvas class="absolute top-0 left-0 pointer-events-none">` sized `panel + 4px` inside a wrapper with `padding-right:6px; padding-bottom:6px` paints a **diagonal-hatch offset shadow** on the right and bottom edges, following the rounded corner. See `detail-popover-hatched-shadow-4x.png`. The same treatment wraps the Edit Prompt modal. |
| Popover section header | `px-4 py-3 border-b border-neutral-200` -> `padding 12px 16px`, `border-bottom 1px solid #d4d4d4`; label `text-xs font-bold text-neutral-600` |
| Theme toggle track | `h-7 rounded-full bg-neutral-200` -> `64x28`, bg `#e5e5e5` (dark `#262626`); knob `span.absolute.top-0.5.h-6.w-8.rounded-full.bg-white.dark:bg-black.shadow-sm` = `32x24` |
| Accent swatch | `w-6 h-6 rounded-full ring-1 ring-black/10` -> `24x24`, ring `oklab(0 0 0/.1) 0 0 0 1px`; grid `grid-cols-5 gap-3` |
| Popover menu item | `flex items-center gap-3 px-4 py-2 text-sm hover:bg-black/5` -> `198x36`, `14px`, `gap 12px` |

### 3.7 Structure canvas

| Element | Computed |
|---|---|
| Tree pane | `.structure-tree ... border-r border-neutral-200`, width persisted in `localStorage['composition.structureTreeWidth'] = "320"`; body `text-[12px]` |
| Resizer | `.structure-tree-resizer w-[5px] cursor-col-resize -mx-[2px]`, hairline `w-px group-hover:bg-accent-500/60` |
| Canvas viewport | `relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50`, inner `absolute inset-0 cursor-grab` |
| Dot grid | inline `<svg><pattern id="canvas-dot-grid" width=24 height=24><circle cx=12 cy=12 r=1 class="fill-neutral-400/20 dark:fill-neutral-500/20">` |
| Transform layer | `absolute origin-top-left will-change-transform` with `transform: translate3d(tx,ty,0); zoom: <scale>; transform-origin: 0 0; transition: opacity 200ms ease-out` - **pan uses `translate3d`, zoom uses the CSS `zoom` property (not `scale`)** |
| Default fit zoom | `11%` for `order_support_agent` |
| Group container | `[data-canvas-group]` `border border-neutral-200/60 bg-[#f7f7f7] dark:border-neutral-700/50 dark:bg-[#1e1e1e]`, `border-radius 8px`, sub-grid `<pattern width=20 height=20><circle r=0.75 class="fill-neutral-400/15">` |
| Group label chip | `absolute -top-3 left-4 rounded bg-white px-2 py-0.5 dark:bg-neutral-900`, label `text-[10px] font-semibold uppercase tracking-wider text-neutral-600` |
| Group badges | `rounded-full px-1.5 py-px text-[9px] font-medium bg-neutral-100 text-neutral-500` |
| Zoom control | `absolute bottom-4 left-4 z-10 rounded-lg` with `-` / `%` / `+` / fit; label `min-w-[3rem] text-center text-[11px] font-medium tabular-nums text-neutral-500` |
| Node data attrs | `data-canvas-node`, `data-canvas-node-id`, `data-canvas-group`, `data-canvas-model-node`, `data-edge-id`, `data-edge-kind`, `data-edge-tool-kind`, `data-model-anchor`, `data-variables-section`, `data-tool-column` |
| Node card types found | `Agent` (root, `AI + Human`), `Prompt`, `Function`, `Sub-agent`, `Human`, `Model` |

---

## 4. Motion / keyframes (live dump)

```
sidebar-cascade-in-2e6b3ace : 0% {opacity:0; transform:translateY(-4px)} 100% {opacity:1; transform:translateY(0)}
                              applied as .sidebar-cascade { animation: .2s ease-out 1 normal both }
typing-pulse-909ea0dc       : 0%,60%,100% {opacity:.3}  30% {opacity:1}
log-details-pulse-a7031a9c  : 0%,100% {opacity:1; transform:scale(1)}  50% {opacity:.55; transform:scale(1.25)}
fadeIn / fadeOut            : opacity 0<->1
pulse                       : 50% {opacity:.5}
spin                        : 100% {transform:rotate(360deg)}
```

Element-level transitions:
- `aside` -> `all .3s cubic-bezier(.4,0,.2,1)` (sidebar collapse)
- `.threads-col` -> `width .2s, min-width .2s cubic-bezier(.4,0,.2,1)` (column collapse)
- rows/pills -> Tailwind `transition-colors` = `.15s cubic-bezier(.4,0,.2,1)`
- `.sender-avatar` -> `opacity .18s, filter .18s`, parent `.sender-avatar-switch { perspective: 96px }`,
  front/back faces run a `.19s linear both` 3D flip
- canvas transform layer -> `opacity 200ms ease-out`

---

## 5. Diff vs `04-assets-css/design-tokens.md`

The prior static extraction is **accurate wherever it overlaps**. Deltas:

| # | Prior file | Live reality | Impact |
|---|---|---|---|
| 1 | `--agents-accent-surface-*` listed as `var(--accent-500)` | That is only the no-`color-mix` fallback. Chrome applies the `@supports (color: color-mix(in lab, red, red))` branch: `color-mix(in oklab, var(--accent-500) 8/18/26%, #fff)` (light) and `14/28/36%, #0a0a0a` (dark). | **High** - rebuilding with a flat `#a855f7` selected row is wrong; correct light value is `#efe3ff`. |
| 2 | `--agents-accent-text-muted` = `var(--accent-700)` | Fallback only; real light value `color-mix(in oklab, #7e22ce 78%, #171717)` = `#6527a2`; real dark value `color-mix(in oklab,#e9d5ff 72%,#fafafa)` = `#eedffe`. | Medium |
| 3 | No accent-theme list | `:root[data-accent="..."]` ramps exist for amber, lime, emerald, sky, blue, indigo, fuchsia, pink, white (+ default purple) - the 10 gear-popover swatches. | Medium |
| 4 | Body font size not recorded | `body { font-size: 15px }`, and `body` uses a *different* font stack than `--font-sans`. | Medium |
| 5 | `--vt-c-*` not listed | Present and load-bearing for `--color-background*` / `--color-heading` / `--color-text`. Dark body bg is `#181818`, but `.app-container` overrides to `#000` (`dark:bg-black`). | Medium |
| 6 | Shadow table lists Tailwind `shadow-*` utilities | Panels/popovers use **no** `box-shadow`. Depth comes from a canvas-drawn diagonal-hatch shadow (6px offset). `shadow-sm` appears only on the theme-toggle knob. | **High** - visual signature. |
| 7 | Table styling implied | The Agents/Threads lists are CSS **grids** (`grid-cols-[36px_1fr_72px_80px_1fr_32px]`), header `11px/600`, *not* uppercase, *not* letter-spaced. Only the inspector **log** table is a real `<table>` whose `th` is `10px/500/uppercase/0.25px`. | **High** - the two header styles are different and easy to conflate. |
| 8 | Breakpoint `431px` custom | Confirmed present; also `--container-*` scale `xs 20rem` .. `7xl 80rem`. | Low |
| 9 | Neutral ramp given only in oklch | Exact sRGB hex added above. | Low |
| 10 | Accent scale hex | Identical, no mismatch. | - |
| 11 | `--color-border` `#d4d4d4` / dark `#404040` | Confirmed exactly; this is `neutral-300` / `neutral-700`. | - |

No contradictions were found - every prior value that appears live matched.
