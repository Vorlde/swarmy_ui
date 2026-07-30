# View Spec: Agents pane (cascade section 1)

- **Route:** `/agents` (name: `agents`) - rendered by `CompositionView`, see `composition-view.md`
- **Auth:** Required
- **Component:** `src/views/composition/AgentsPane.vue`
- **Stores:** `agentsStore`, `threadsStore` (per-agent thread counts), `uiStore` (filter selection)

## Capture reconciliation

The earlier draft of this spec described a standalone `AgentsView` at `/agents` that pushed to `/agents/:id`. **That view does not exist in the live app.** Corrected against `agents-list-1col-light.png`, `agents-cascade-fullwidth-3500-light.png`, `agents-row-hover-light.png`, `agents-row-kebab-menu-light.png` and `exact-tokens.md` 3.3:

- `/agents` renders the **cascade** (`CompositionView`). The agents list is snap section 1 of that cascade, not a page. There is no `/agents/:id` route.
- Selection lives in the **query string**: `/agents?agent=<agent_name>&thread=<uuid>`. Selecting an agent appends the Threads/Messages/Inspector snap section and smooth-scrolls to it.
- The list is a **CSS grid**, not a `<table>` and not `DataTable`'s `caps` header variant.
- Filters are a **segmented control**, not badge chips.

## Purpose

Lists every saved agent composition, lets the user search, filter by agent type, create a new composition, and select one - which grows the cascade with that agent's threads, messages, inspector and structure.

## Layout

Snap section 1 of `.composition-scroll-container`. Section shell: `rounded-xl overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900` (resolves to `1px solid #d4d4d4`, radius 12px, background `#ffffff`). Measured width at a 1512 viewport: **782px** (`[offsetLeft, width] = [-1, 782]`).

Three stacked bands: column header bar, toolbar, list.

```
+---------------------------------------------------------------------+
| [robot] Agents (3)                                                  |  <- h2 16px/700, count 12px mono #737373
+---------------------------------------------------------------------+
| [ Search agents...          ] [All|AI+Human|Dual AI] [+ New Agent]  |
+---------------------------------------------------------------------+
| 36px |        1fr        | 72px    | 80px |        1fr        | 32px|
|      | Title           ^ | Threads ^| Type ^| Sides            |     |  <- 11px/600, NOT uppercase
|------|-------------------|---------|------|-------------------|-----|
| [av] | fraud_review_agent| [] 2    |Dual AI| A risk_analyst    | ... |
|      |                   |         |      | B customer_advocate|    |
| [av] | inventory_check_a.| [] 3    |Dual AI| A inventory_worker| ... |
|      |                   |         |      | B inventory_review.|    |
| [av] | order_support_ag. | [] 2    |AI+Hum.| A order_support   | ... |  <- SELECTED
|      |                   |         |      | B Human           |     |
+---------------------------------------------------------------------+
```

### Measured chrome (`exact-tokens.md` 3.2 / 3.3 / 3.4)

| Element | Value |
|---|---|
| Column header bar | `px-4 py-3 border-b border-neutral-200` -> `padding 12px 16px`, `border-bottom 1px solid #d4d4d4` |
| Title `h2` | `text-base font-bold` -> 16px / 700 / lh 24px, `#000` |
| Count span | `text-xs font-mono text-neutral-500` -> 12px, `#737373` |
| Grid template | `grid-cols-[36px_1fr_72px_80px_1fr_32px]`, `gap-x-4` (16px) |
| Grid header row | `px-5 py-2`, `text-[11px] font-semibold text-neutral-400 dark:text-neutral-500`, `letter-spacing: normal`, `text-transform: none`, height 35px, `border-bottom 1px solid #d4d4d4` |
| Header sort button | `flex items-center gap-1 text-left`, inherits 11px/600/`#a1a1a1` |
| Row | `px-5 py-3 text-[13px]` -> `padding 12px 20px`, lh 20.8px, height **66px**, transparent |
| Row hover | `.agents-surface-hover:hover` -> `#f8f2ff` light / `#1c1525` dark |
| Row selected | `.agents-surface-selected` -> **`#efe3ff`** light / `#302043` dark, plus `.agents-border-selected` `#9333ea` / `#c084fc` |
| Row title | `truncate font-medium text-neutral-900` -> 13px / 500 / `#171717` |
| Row avatar | `img.h-9.w-9.rounded-md.object-cover` -> 36x36, radius 6px |
| Type cell idle / selected | `#737373` / `.agents-text-selected-muted` = **`#6527a2`** light, `#eedffe` dark |
| Row transition | `transition-colors` = `.15s cubic-bezier(.4,0,.2,1)` |
| Search box | `label` with `border 1px solid #d4d4d4`, radius 8px, bg `#fff`, `padding 6px 12px`, `gap 8px`, height 34px, 14px text, placeholder `#a1a1a1` |
| Segmented group | `border 1px solid #d4d4d4`, radius 6px, 11px, height 32px; active (`All`) `bg #171717` / `#fff` / `padding 6px 10px` / weight 500; idle transparent `#737373` |
| `New Agent` button | `bg #171717`, `#fff`, radius 6px, `padding 6px 12px`, 11px/500, `gap 4px`, 99x30 |

Column semantics: track 1 is the avatar (no header label), track 6 is the kebab (no header label). `Sides` renders one line per side with a small `A` / `B` prefix glyph; `ai_human` agents show `A <prompt>` / `B Human`.

## Components used

- `DataTable` in `headerStyle="plain"` mode - the agents grid (see `specs/components/data-table.md`); its column set is registered as list id `agents` in the `listColumns` registry
- `SearchInputWrapper` - the search field
- `UiSegmentedControl` - `All` / `AI+Human` / `Dual AI`
- `UiButton` (`variant="primary"`, size `xs`) - `New Agent`
- `AgentAvatar` - 36px row avatar
- `RowKebabMenu` - `Edit / Pack / Delete`
- `UiEmptyState`, `Loader`, `UiAlertBox` - standard states
- `AgentModal` (via `EditSurfaceHost`) - create-new-agent dialog

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/agents` | On mount | `{ agents: AgentSummary[] }` with `id`, `name`, `title`, `type` (`dual_ai`, `ai_human`), `default_prompt`, `default_model`, `tools`, `side_a_label`, `side_b_label`, `side_*_agent_prompt`, `packed`, `created_at`. |
| `GET /api/threads?agent_id=<id>&limit=1` | After agents load, per visible row | Supplies the `Threads` count column (uses `total`). Lazy per visible row, cached in `threadsStore`. |
| `WS /api/events` | While mounted (global socket) | `thread_created` / `thread_deleted` refresh the count column; registry events refresh the list. |

Search and type filtering are client-side over the loaded list; there is no server round trip.

## User interactions

1. **Click a row** -> `router.replace({ query: { ...query, agent: agent.name } })`. The cascade appends the Threads section and smooth-scrolls to it. The row takes the selected surface.
2. **Click a segment** -> narrows to `ai_human` / `dual_ai`; `All` clears. Persisted in `uiStore`.
3. **Type in search** -> client-side substring filter on title.
4. **Click a column header** -> toggles sort; the active header shows a caret glyph.
5. **Click the kebab** -> menu `Edit / Pack / Delete` (`absolute right-0 top-8 z-30 min-w-[160px] origin-top-right rounded-lg border`, 160x129). The row click handler must not swallow the button; stop propagation on the kebab.
6. **Click `New Agent`** -> `AgentModal` create flow via the uiStore modal stack.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading** | `/api/agents` in flight | Skeleton rows (`--animate-pulse`) |
| **Ready** | Loaded, filter applied | Populated grid |
| **Empty** | `agents: []` | `UiEmptyState` + "Create your first agent" CTA |
| **Empty filter result** | Segment/search excludes everything | `UiEmptyState` + clear-filter action |
| **Selected** | `?agent=` matches a row | Row on `--agents-accent-surface-selected`; cascade has grown |
| **Error** | Fetch fails | `UiAlertBox` above the grid with retry |
| **Auth expired** | Any 401 | Global unauthorized handler -> `/login?redirect=/agents` |
| **Counts loading** | Per-row thread count in flight | Count cell shows a muted dash |

## Theming

- **Section chrome:** the snap section is `rounded-xl` + `border-black/10` + `bg-white`; the page behind is `bg-neutral-50/80`. Chrome is one token set shared by all three cascade sections.
- **Selection and hover:** `--agents-accent-surface-selected` / `-hover` / `-border` / `-text-muted`. These resolve through `color-mix(in oklab, var(--accent-500) 18%/8%, #fff)` under `@supports (color: color-mix(in lab, red, red))`, with a flat fallback for browsers without it. Re-theming the accent recolors selection everywhere. **Never hardcode `#efe3ff`.**
- **Density:** row height and padding follow `--spacing`; a compact theme changes one token. Column tracks live in the registered column set, so a density or column change is data, not markup.
- **Elevation:** none. This section has a border, not a shadow. Depth in this app comes only from `DropShadow`.
- **Full reskin:** swapping the grid for a card list is a change to the registered `agents` `ListDef` plus a cell component; stores, endpoints and route wiring are untouched.

## Notes

- Agent `type` values observed: `dual_ai`, `ai_human`. Side labels are `null` for `ai_human`; those rows render `A <prompt>` / `B Human`.
- The pane never imports `lib/api`; all fetching lives in stores.
