# Build Order - swarmy_ui replica spine

Dependency-ordered phases for an **exact replica** of the UI captured in
`visual-reference/`, built on a **pluggable spine**. Phases run in order; the
work items inside a phase are sized to be handed to parallel agents, one item
each, with no shared files.

Two governing criteria, in this order:

1. **Exact replica.** `visual-reference/exact-tokens.md` is authoritative
   (ADR-009). Nothing is "improved" while replicating. Any deviation needs an
   entry in `specs/REPLICA-DELTA.md`; exactly one exists today.
2. **Pluggable spine.** Views, panes, inspector tabs, canvas node types and list
   column sets are registered, not hardcoded (ADR-008). No phase may hardcode a
   value or a component name merely to make a screenshot match.

Standing rules for every phase: no `shadow-*` utility (use `DropShadow`), no
`<table>` (use a registered column set), no literal accent hex, no `v-if` chain
over a pluggable type, and `npx vue-tsc --noEmit` stays green.

---

## Phase 0: Spine (DONE)

Landed on `replica/spine` before this plan:

- Typed client regenerated as `PlatformApi`; generator fixed at the source.
- `src/lib/api.ts` - the single networking seam.
- `src/plugins/registry.ts` + `src/plugins/index.ts` - the four registries and
  the plug auto-loader.
- `src/router/routes.ts` as data + registry-resolved views.
- Typecheck green.

**Exit criteria:** met. See `PORT-NOTES.md`.

---

## Phase 1: Tokens + shell + rail

The whole app's chrome. Everything after this depends on it, so it is the one
phase that is deliberately not parallel-heavy.

| # | Item | Owner notes |
|---|---|---|
| 1.1 | `src/assets/tokens.*.css` - primitives, semantic, component layers per ADR-001 **as amended**: full `--accent-*` ramp, the ten `:root[data-accent]` ramps, the `@supports color-mix` branch for `--agents-accent-*` (and the flat fallback), neutral ramp, `--color-border`, radius/spacing/motion tokens, `--dropshadow-*` and `--elevation-*`. | Blocks everything |
| 1.2 | App shell: `body { font-size: 15px }` + both font stacks, `.app-container` `bg-neutral-50/80`, `main.rounded-l-xl.border-l.my-3`. | |
| 1.3 | `Sidebar` - 240px / 64px collapse, nav config array as the plug point, `Agents` + agent context pill + cascade items + Marketplace/Models/Providers/Docs + gear/logout footer. `sidebar-cascade-in` animation. | `specs/components/sidebar.md` |
| 1.4 | `DropShadow` - the app's only elevation mechanism. Defaults 6/6/diagonal, canvas sized content+4px, wrapper padding 6px right/bottom, `ResizeObserver` + `.dark` `MutationObserver`. | ADR-009 D2 |
| 1.5 | `Popover` primitive on `DropShadow`: no enter/leave transition, closes on outside click only (Escape does **not** close it), `absolute bottom-full mb-2 left-0 z-50` positioner for the rail. | |
| 1.6 | Settings popover contents: Appearance sun/moon pill, ten accent swatches (`grid-cols-5 gap-3`), four menu links. Theme -> `class="dark"` on `<html>`; accent -> `data-accent`. | |
| 1.7 | Auth: `authStore` against `src/lib/api.ts`, route guard, `LoginView` registered as view id `login`. | `specs/views/login-view.md` |

**Parallel:** 1.4 + 1.5 + 1.7 can run alongside 1.3 once 1.1 lands.
**Exit criteria:** `/login` and the empty shell render pixel-matched against
`login-1512-light.png`, `sidebar-collapsed-light.png`,
`settings-gear-popover-{light,dark}.png` in both themes and both rail widths.

---

## Phase 2: The list system (grids)

One primitive, exercised by the first real list. Getting this wrong is the
single most expensive mistake in the build, because every list depends on it.

| # | Item |
|---|---|
| 2.1 | `DataTable` as a **CSS grid** driven by a registered `ListDef`: template derived from column tracks, `headerStyle: "plain" \| "caps"`, sorting, search, row actions, selection, expandable rows, skeleton/empty/error states. |
| 2.2 | `SearchInputWrapper`, `UiSegmentedControl`, `RowKebabMenu` (`absolute right-0 top-8 z-30 min-w-[160px]`, 160x129, `Edit / Pack / Delete`). |
| 2.3 | `UiButton`, `UiBadge`, `UiEmptyState`, `Loader`, `UiAlertBox`, `CopyButton`, `TimeAgo` reconciled with `specs/components/*`. |
| 2.4 | Agents pane (cascade section 1) on the `agents` column set: `36px 1fr 72px 80px 1fr 32px`, `gap-x-4`, 11px/600 non-uppercase header, 66px rows, `.agents-surface-hover` / `-selected` / `-border`. |

**Parallel:** 2.2 and 2.3 alongside 2.1; 2.4 after 2.1.
**Exit criteria:** `agents-list-1col-light.png` and `agents-row-hover-light.png`
match, including the 66px row height and the `#6527a2` selected type cell. No
`<table>` element exists in the codebase.

---

## Phase 3: Cascade shell + thread transcript

| # | Item |
|---|---|
| 3.1 | `CompositionView` - `.composition-scroll-container` (`overflow-x:auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`), 12px flex-gap track, `rounded-xl` bordered snap sections, section list as an ordered descriptor array. Selection in the query string (`?agent=`, `?thread=`). |
| 3.2 | `ThreadsPane` - `.threads-col` 280px with the 48px collapsed variant and its `.2s` width transition; header with live dot, magnifier-to-search, `+`; thread items; sub-agent thread groups. |
| 3.3 | `MessagesPane` - transcript: role bubbles (`agents-surface-message` `#efe3ff`, `rounded-2xl px-4 py-2.5 text-[15px] leading-7`), markdown + tables, inline sub-agent cards with `complete` / `error` badges, collapsed "2 ops" chips, reasoning disclosure, cost chip in the header. |
| 3.4 | `MessageComposer` - sender avatar flip (`perspective: 96px`, `.19s linear both`), attachment button, send; `typing-pulse` indicator. |
| 3.5 | `ThreadsView` - `/threads` and `/threads/:id` reusing 3.1-3.4 with section 1 absent. Not a fork. |
| 3.6 | WebSocket layer: `/api/events`, `/api/threads/:id/stream`, `/api/threads/:id/logs`, with backoff and the store-owned subscription rules of ADR-006. |

**Parallel:** 3.2, 3.3, 3.4, 3.6 after 3.1; 3.5 last.
**Exit criteria:** `agents-cascade-3col-light.png`,
`agents-cascade-snap2-*.png`, `threads-subagent-group-expanded-light.png`,
`threads-search-open-light.png` match, and the cascade grows by *scrolling*, not
by a transform.

---

## Phase 4: Inspector + the one real table

| # | Item |
|---|---|
| 4.1 | `ThreadInspectorPane` - the tab strip with the sliding active pill (a separate absolutely-positioned `#171717` element behind `relative z-10` labels) and the `...` overflow when the strip does not fit. Tabs come from `orderedInspectorTabs()`. |
| 4.2 | `LogsTable` - **the only `<table>` in the app**. Columns `Prompt / Model / Cost / Tools Called / Called At`; selected row on `--agents-accent-surface-selected`. Re-measure the `th` against the running build and settle the one recorded capture conflict. |
| 4.3 | `LogDetails` - slides up from the bottom; header (prev/next, status pill, provider/model chips, `Copy cURL`, close), four stat tiles, Request/Response toggle, `Full Response Body` via `JsonViewer`. `log-details-pulse` on live rows. |
| 4.4 | Tab plugs: `Files`, `KV Store` (badge), `Effects`. |
| 4.5 | Tab plugs: `Agent Configuration`, `Thread Settings` (CREATED/AGENT/TAGS, Watchdog card, Variables editor, Developer Tools with `Continue` / `Delete Thread`). |
| 4.6 | `JsonViewer` + `UiCodeBlock` reconciled with their specs; Shiki singleton per ADR-004. |

**Parallel:** 4.2+4.3 as one unit, 4.4, 4.5, 4.6 all independent after 4.1.
**Exit criteria:** all six `agents-inspector-*-light.png` match; the pill slides
rather than repaints; `agents-thread2-transcript-2200-light.png` reproduces at
18 log rows with the detail panel open.

---

## Phase 5: Structure tree + canvas

The largest item, and the one with the most bespoke mechanics.

| # | Item |
|---|---|
| 5.1 | Snap section 3 shell: shared `Structure <agent>` header, `.structure-tree` 320px persisted to `localStorage["composition.structureTreeWidth"]`, `.structure-tree-resizer`. |
| 5.2 | `StructureTree` / `StructureTreeRow` - 12px body, disclosure rows, count/None suffixes, edit glyphs. |
| 5.3 | `usePanZoom` - `translate3d` pan + **CSS `zoom`** scale, stepped `+`/`-`, fit-to-content default (11%), fit-to-screen, `cursor: grab`. Screen-to-canvas math per ADR-009 D3. |
| 5.4 | `CanvasGrid` (24x24 dot pattern), group containers + label chips + badges (20x20 sub-grid), `CanvasEdges` with per-kind anchors. |
| 5.5 | `buildLayout()` - the auto-layout heuristic and node measurement (remember: measured sizes come back zoomed). |
| 5.6 | Node plugs, one agent each, all registering into `canvasNodes`: `agent`, `prompt`, `function`, `subagent`, `human`, `model`. |
| 5.7 | `CanvasControls` - `absolute bottom-4 left-4`, `- / % / + / fit`. |

**Parallel:** 5.2, 5.3, 5.7 immediately after 5.1; the six items of 5.6 are six
parallel agents once 5.4 and 5.5 land.
**Exit criteria:** `structure-tree-canvas-fit-light.png` at 11%,
`structure-canvas-zoom50-light.png` at 51% with crisp text, and each
`structure-node-*-zoom50-light.png` crop matching its card.

---

## Phase 6: Settings and CRUD pages

Fully parallel: one agent per page, all on the Phase 2 list system with
`headerStyle="caps"`.

| # | Item |
|---|---|
| 6.1 | `/prompts` |
| 6.2 | `/tools` |
| 6.3 | `/models` |
| 6.4 | `/providers` |
| 6.5 | `/marketplace` - including the verbatim empty state ("No packages have been published yet.") with the `Recently updated` / `Most installed` sort tabs above it |
| 6.6 | `/settings/users` |
| 6.7 | `/settings/api-keys` |
| 6.8 | `/settings/my-variables` and `/settings/instance-variables` |

Each item registers its own view plug and its own column set; none of them edits
a core file.
**Exit criteria:** each page matches its `*-1512-light.png` **and** its
`*-1512-dark.png`.

---

## Phase 7: Modals

Modals are replicated **as they are today**. Whether edit surfaces should later
become routed pages is not a decision this plan makes; do not pre-empt it.

| # | Item |
|---|---|
| 7.1 | `Modal` primitive - `position: fixed`, wrapped in `DropShadow` (same 6px hatch as the popovers), focus trap, section-pill top nav that scrolls a section into view. |
| 7.2 | Edit Prompt modal at `/prompts/:id` - one long stack: Basics / Schema / Prompt / Tools / Hooks / Variables / Behavior. **INTENTIONAL DEVIATION:** the live modal's inner scroll is broken (everything below `Behavior` is unreachable at any viewport); the replica gives the inner container a working scroll. This is the only deviation in the build and it is recorded in `specs/REPLICA-DELTA.md`. |
| 7.3 | `ModelModal`, `PromptModal`, `ConfirmDialog`, `SchemaEditor`, Monaco wiring per ADR-003. |
| 7.4 | Pack / Unpack / Publish modals. |

**Parallel:** 7.2, 7.3, 7.4 after 7.1.
**Exit criteria:** `prompt-edit-modal-tall-1512x2400-light.png` matches
section-for-section, every section pill scrolls its section into view, and
`Behavior` is fully reachable by scrolling.

---

## Phase 8: Fidelity pass and hardening

| # | Item |
|---|---|
| 8.1 | Side-by-side diff of every one of the 69 captures, light and dark, at the captured viewport. Each mismatch is a fix or a `REPLICA-DELTA.md` entry - never silently accepted. |
| 8.2 | Motion audit against `exact-tokens.md` section 4, including the `body.enable-motion` gate and `prefers-reduced-motion`. |
| 8.3 | Accent-swap validation: all ten `data-accent` ramps, both themes. This is the acceptance test for ADR-001. |
| 8.4 | Plug-seam validation: add a throwaway feature with a view, an inspector tab, a canvas node kind and a column set, and confirm it needs no core edit beyond one route-table line. This is the acceptance test for ADR-008. |
| 8.5 | Zod coverage at the API boundary, keyboard/focus pass, bundle split (Monaco, Shiki, canvas), typecheck + lint green. |

---

## Dependency graph

```
0 Spine
  |
  v
1 Tokens + shell + rail
  |
  +---------------------------+
  v                           v
2 List system            (1.7 auth done)
  |
  v
3 Cascade + transcript ------> 6 Settings/CRUD pages   (needs only 1 + 2)
  |                                    |
  v                                    |
4 Inspector + log table                |
  |                                    |
  v                                    v
5 Structure tree + canvas         7 Modals   (needs 1 + 2)
  |                                    |
  +------------------+-----------------+
                     v
              8 Fidelity pass
```

Phases 6 and 7 depend only on 1 and 2, so they can run concurrently with 3-5
given enough agents. Phase 8 needs everything.

## Rough sizing

| Phase | Items | Parallel width | Effort |
|-------|-------|----------------|--------|
| 1. Tokens + shell + rail | 7 | 3 | 4-5 days |
| 2. List system | 4 | 3 | 3-4 days |
| 3. Cascade + transcript | 6 | 4 | 6-8 days |
| 4. Inspector + log table | 6 | 4 | 6-8 days |
| 5. Structure tree + canvas | 7 | 6 | 2-3 weeks |
| 6. Settings/CRUD pages | 8 | 8 | 4-5 days |
| 7. Modals | 4 | 3 | 4-5 days |
| 8. Fidelity pass | 5 | 3 | 5-7 days |
