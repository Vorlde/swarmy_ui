# MANIFEST - visual reference capture

69 PNGs captured from the live app at `http://localhost:5173` on 2026-07-30 with Playwright
(Chromium 151, headless). Unless stated otherwise: **viewport 1512x850, deviceScaleFactor 2**
(so a `1512x850` capture is a `3024x1700` file), `fullPage: true`, light theme, logged in as
`admin`. Interactive states were first reproduced/verified in the real browser via the
Claude-in-Chrome extension, then re-captured with Playwright for disk fidelity.

Deep link used throughout:
`/agents?agent=order_support_agent&thread=4ae6b87e-9270-442a-9977-91b448ef73ea`

Companion file: `exact-tokens.md` (computed CSS values, custom properties, motion).

---

## Login

| File | Route / state | Viewport | How to reach |
|---|---|---|---|
| `login-1512-light.png` | `/login`, empty | 1512x850 | clear `localStorage`, go to `/login` |
| `login-1512-light-filled.png` | `/login`, both fields filled (`admin`/`admin`), pre-submit | 1512x850 | fill username + password, do **not** submit |
| `login-1920-light.png` | `/login`, empty | 1920x1080 | - |
| `login-1512-dark.png` | `/login`, empty, dark | 1512x850 | set dark in gear popover first, then log out / clear tokens |

## /agents - cascade

At 1512 the cascade **overflows horizontally**; `.composition-scroll-container` has
`scroll-snap-type: x mandatory` with three snap sections
(`[offsetLeft,width] = [-1,782] [793,1143] [1948,1223]`, scrollWidth 3171 / clientWidth 1271).
Section 1 = Agents list. Section 2 = Threads + Messages + Inspector. Section 3 = Structure.

| File | Route / state | Viewport | How to reach |
|---|---|---|---|
| `agents-list-1col-light.png` | `/agents` with no agent selected - agents grid only | 1512x850 | navigate to `/agents` |
| `agents-cascade-3col-light.png` | deep link, scrollLeft 0: Agents + Threads + clipped Messages | 1512x850 | deep link |
| `agents-cascade-3col-dark.png` | same, dark | 1512x850 | gear popover -> moon |
| `agents-cascade-snap2-threads-messages-inspector-light.png` | snapped to section 2: Threads + Messages + Inspector | 1512x850 | scroll cascade right one snap (or click a thread) |
| `agents-cascade-snap2-threads-messages-inspector-dark.png` | same, dark | 1512x850 | - |
| `agents-cascade-snap3-structure-light.png` | snapped to section 3: Structure tree + canvas | 1512x850 | scroll cascade to the last snap |
| `agents-cascade-1920-light.png` | deep link at 1920 | 1920x1080 | - |
| `agents-cascade-fullwidth-3500-light.png` | **whole cascade, nothing clipped** - reference for column widths | 3500x900, dsf 1 | oversized viewport |
| `agents-cascade-fullwidth-3500-dark.png` | same, dark | 3500x900, dsf 1 | - |
| `agents-thread2-transcript-2200-light.png` | 2nd thread (`540aeabf`) selected: rich transcript with **inline sub-agent cards** (`complete` / `error` badges), collapsed "2 ops" chip, markdown table, full Logs table (18 rows) + log detail panel with 4 stat tiles | 2200x1300 | deep link -> click 2nd thread in Threads column |

## /agents - inspector tabs

All captured at **2200x900** with the cascade scrolled fully right so the inspector is fully
visible. Reached by clicking the tab pill in the inspector header.

| File | Tab |
|---|---|
| `agents-inspector-logs-light.png` | **Logs** (default) - log table + detail panel open with `PERFORMANCE / # TOKENS / COST / CONTEXT` stat tiles, Request/Response toggle, Full Response Body JSON viewer |
| `agents-inspector-files-light.png` | Files |
| `agents-inspector-kv-store-light.png` | KV Store (badge count `1`) |
| `agents-inspector-effects-light.png` | Effects |
| `agents-inspector-agent-configuration-light.png` | Agent Configuration |
| `agents-inspector-thread-settings-light.png` | Thread Settings - CREATED/AGENT/TAGS block, **Watchdog** card (`STANDING BY`, `STOOD DOWN` log line, `Run check now`), Variables editor, Developer Tools (`Continue`, `Delete Thread`) |

Note: when the inspector is narrower than the tab strip, the tabs collapse behind a `...`
overflow button (visible in `threads-list-1512-light.png`).

## /agents - Structure pane

| File | State | Viewport | How to reach |
|---|---|---|---|
| `structure-tree-canvas-fit-light.png` | Structure: outline tree (320px) + canvas at default fit (**11%**) | 1512x850 | sidebar -> `Structure` |
| `structure-tree-canvas-fit-1920-light.png` | same at 1920 | 1920x1080 | - |
| `structure-tree-canvas-fit-dark.png` | same, dark | 1512x850 | - |
| `structure-canvas-zoom50-light.png` | canvas zoomed to **51%**, cards readable | 1512x850 | click canvas `+` 12x (11% -> 51%) |

### Individual node cards (clipped from the 51% canvas)

Each was centred by adjusting the transform layer's `translate3d`, then clipped with a 12px
bleed. No clicks on nodes (read-only).

| File | Node type |
|---|---|
| `structure-node-agent-root-zoom50-light.png` | **AGENT** root card (`AI + Human`, `order_support_agent`) |
| `structure-node-prompt-zoom50-light.png` | **PROMPT** card (`order_support`, Support side) - Tool/Context/Reasoning columns, Input schema, Variables, Functions / Sub-prompts / Handoffs / Sub-agents rail |
| `structure-node-function-zoom50-light.png` | **FUNCTION** card (`find_order`) |
| `structure-node-subagent-zoom50-light.png` | **SUB-AGENT** card (`inventory_check_agent`, `Dual AI`, `max 8 session turns`) |
| `structure-node-human-zoom50-light.png` | **Human** node |
| `structure-node-model-zoom50-light.png` | **MODEL** card (`openrouter` / `deepseek/deepseek-v4-flash` with pricing + capability chips) |

## Interactive states / popovers

| File | State | How to reach |
|---|---|---|
| `settings-gear-popover-light.png` | Gear popover open: Appearance sun/moon toggle, 10 Accent Color swatches, My Variables / Instance Variables / Users / API Keys | click gear icon, sidebar bottom-left |
| `settings-gear-popover-dark.png` | same, dark | - |
| `agent-context-switcher-popover-light.png` | Agent context switcher (FormKit combobox) open under the sidebar logo: search field + 3 agents with type sublabel, thread count, checkmark on active. *(Gear popover is also open in this frame - it stays open on Escape; it closes only on outside click.)* | click the `order_support_agent` pill in the sidebar |
| `agents-row-kebab-menu-light.png` | Kebab (3-dot) on the `fraud_review_agent` row clicked -> menu `Edit / Pack / Delete`. Menu element: `absolute right-0 top-8 z-30 min-w-[160px] origin-top-right rounded-lg border`, rendered `160x129` at `(841, 204)`. | click the `...` at the right of a row (Playwright `.click()` is intercepted by the row handler - dispatch `button.click()` via `page.evaluate`) |
| `agents-row-hover-light.png` | Hover on the `inventory_check_agent` row (`.agents-surface-hover:hover` -> `#f8f2ff`) | hover row 2 |
| `threads-search-open-light.png` | Threads column search field expanded | click the magnifier in the Threads header |
| `threads-subagent-group-expanded-light.png` | `fraud_review_agent (2)` sub-agent thread group expanded in the Threads column | click the group row |
| `sidebar-collapsed-light.png` | Sidebar collapsed to icon rail | click the chevron next to the AgentBuilder logo |
| `detail-popover-hatched-shadow-4x.png` | 4x zoom crop of the gear-popover bottom-right corner, showing the **canvas-drawn diagonal-hatch drop shadow** (6px offset right+bottom, follows the 8px corner radius). Clip only, not fullPage. | gear popover open, clip 100x140 at dsf 4 |

## Other routes (light + dark pairs)

All 1512x850, fullPage. Dark variants are identical states with `.dark` on `<html>` via the
gear popover.

| File pair | Route |
|---|---|
| `threads-list-1512-{light,dark}.png` | `/threads` - Threads + Messages + Inspector (no Agents column), inspector tabs collapsed behind `...` |
| `prompts-1512-{light,dark}.png` | `/prompts` - prompt table (5 rows) |
| `tools-1512-{light,dark}.png` | `/tools` |
| `models-1512-{light,dark}.png` | `/models` |
| `providers-1512-{light,dark}.png` | `/providers` |
| `marketplace-1512-{light,dark}.png` | `/marketplace` |
| `settings-users-1512-{light,dark}.png` | `/settings/users` |
| `settings-api-keys-1512-{light,dark}.png` | `/settings/api-keys` |
| `settings-my-variables-1512-{light,dark}.png` | `/settings/my-variables` |
| `settings-instance-variables-1512-{light,dark}.png` | `/settings/instance-variables` |

| File | Route | Viewport |
|---|---|---|
| `thread-detail-1512-light.png` | `/threads/4ae6b87e-9270-442a-9977-91b448ef73ea` | 1512x850 |
| `thread-detail-2200-light.png` | same, inspector fully visible | 2200x900 |

## /prompts/:id - Edit Prompt modal

Reached by clicking a row in `/prompts` (routes to `/prompts/customer_advocate`). The modal is
`position: fixed` and its inner scroll container is clipped at the viewport bottom - `fullPage`
does **not** grow to fit it, matching the known "scroll may be broken" behaviour.

| File | State | Viewport |
|---|---|---|
| `prompt-edit-modal-1512-light.png` | Modal as it renders at a normal viewport - visibly cut off below the Schema section | 1512x850 |
| `prompt-edit-modal-1920-light.png` | same at 1920 | 1920x1080 |
| `prompt-edit-modal-tall-1512x2400-light.png` | **Best full view** - tall viewport reveals Basics / Schema / Prompt / Tools / Hooks / Variables and the top of Behavior. Still clipped at Behavior. | 1512x2400 |
| `prompt-edit-modal-section-{prompt,tools,hooks,variables,behavior}-light.png` | Each section pill in the modal's top nav clicked (the pill scrolls its section into view; the modal is one long stack, not separate panes) | 1512x2400 |

---

## Behavioral notes (things stills cannot show)

1. **Cascade column entry.** `.composition-scroll-container` is `overflow-x:auto` +
   `scroll-snap-type: x mandatory` + `scroll-behavior: smooth`. Selecting an agent/thread appends
   a snap section and the container smooth-scrolls to it - the "column slide-in" is a *scroll*
   animation, not a transform. Track gap is `12px`; each section is `rounded-xl` + `1px` border.
2. **Column width transitions.** `.threads-col` animates
   `width .2s, min-width .2s cubic-bezier(.4,0,.2,1)` between `280px` and its collapsed `48px`.
   Sidebar `aside` animates `all .3s cubic-bezier(.4,0,.2,1)` between `240px` and `64px`.
3. **Sidebar cascade items** (`Threads`, `Structure`) mount with
   `sidebar-cascade-in: 0% {opacity:0; translateY(-4px)} -> 100%`, `.2s ease-out both`.
   They stagger in when an agent is selected.
4. **Popover open/close.** Popovers have no CSS enter/leave transition - they appear instantly.
   Their depth is a `<canvas>` hatch shadow drawn at open time (6px right/bottom offset).
   Escape does **not** close the gear popover; only an outside click does.
5. **Inspector tab pill.** The active dark pill is a separate absolutely-positioned element
   behind the tab labels (`relative z-10` on the labels), so switching tabs slides the pill
   rather than repainting the tab.
6. **Log detail panel.** Opening a log row slides the detail panel up from the bottom of the
   inspector (`inspector-slide-up-*` classes). A `log-details-pulse` keyframe
   (`opacity 1->.55`, `scale 1->1.25`, 2-step) marks live/streaming rows.
7. **Typing indicator.** `typing-pulse` - `0%,60%,100% {opacity:.3}` / `30% {opacity:1}`,
   staggered across three dots.
8. **Sender avatar flip.** The composer's sender switch (`.sender-avatar-switch`) has
   `perspective: 96px`; front/back faces run a `.19s linear both` 3D rotation, plus
   `opacity .18s, filter .18s` on the avatar itself.
9. **Row/pill hover.** Everything interactive uses Tailwind `transition-colors` =
   `.15s cubic-bezier(.4,0,.2,1)`. Agents rows use `.agents-surface-hover:hover`
   (`#f8f2ff` light / `#1c1525` dark) - the hover tint is accent-derived, not grey.
10. **Structure canvas.** Pan is `transform: translate3d(...)` on the layer; zoom is the CSS
    `zoom` property (not `scale`), so text stays crisp at every level. The layer has
    `transition: opacity 200ms ease-out` and `will-change: transform`. Default view is
    fit-to-content (11% for `order_support_agent`); `+`/`-` step in ~4-point increments; the
    4th button is fit-to-screen. Canvas cursor is `grab` (drag to pan).
11. **Loading states.** `--animate-pulse` (`pulse 2s cubic-bezier(.4,0,.6,1) infinite`,
    `50% {opacity:.5}`) drives skeletons; `--animate-spin` (`1s linear infinite`) drives
    spinners.
12. **Motion gate.** `<body class="enable-motion">` - all of the above is presumably suppressed
    when that class is absent.
13. **Live status dots.** The green `8px` dot next to Threads/Messages titles reflects the
    WebSocket connection; it is static in every capture but is driven by socket state.

## Not captured / caveats

- `/marketplace/:name` package detail - **cannot** be captured: this instance has no published
  packages. `/marketplace` renders the empty state verbatim: *"No packages have been published
  yet."* with the `Recently updated` / `Most installed` sort tabs above it and 0 links or
  buttons inside `main`. Captured in `marketplace-1512-{light,dark}.png`.
- The Edit Prompt modal's `Behavior` section bottom is unreachable in a screenshot because the
  modal's internal scroll is broken; `prompt-edit-modal-tall-1512x2400-light.png` shows the
  maximum that renders.
- Dark variants were not made for the inspector tabs, structure zoom-50 crops, or the
  interactive popovers other than the gear popover - all colour deltas for those are recorded
  numerically in `exact-tokens.md` section 2.2 / 3.
- Strictly read-only: no create/save/delete/submit was clicked. The theme was toggled to dark
  and back to light; no other setting was changed.
