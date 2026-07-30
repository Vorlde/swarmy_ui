# View Spec: ThreadsView (cascade, agent-less)

- **Routes:** `/threads` (name: `threads`) and `/threads/:id` (name: `thread-detail`)
- **Auth:** Required
- **View component:** `src/views/ThreadsView.vue`
- **Stores:** `threadsStore`, `agentsStore` (agent labels), `uiStore` (search state, snap position)

## Capture reconciliation

The earlier draft described a full-page paginated list with a search box, an agent dropdown, a date-range filter and a pager, where a row click navigated away to a separate inspector page. **The live app does none of that.** Corrected against `threads-list-1512-light.png`, `threads-list-1512-dark.png`, `threads-search-open-light.png`, `threads-subagent-group-expanded-light.png`, `thread-detail-1512-light.png`, `thread-detail-2200-light.png`:

- `/threads` renders the **same cascade shell as `/agents`, minus the Agents section**: Threads + Messages + Inspector. See `composition-view.md`; the two routes share one shell component and differ only in whether section 1 is present.
- There is **no pager, no agent dropdown, no date filter**. The Threads column header has a title, a count, a live dot, a magnifier that expands a search field in place, and a `+` button.
- Selecting a thread does not navigate to another page; it binds the Messages and Inspector panes in the same section. `/threads/:id` is the deep-link form of that selection.
- The inspector tab strip **collapses behind a `...` overflow button** when the inspector is narrower than the strip - visible at 1512 in `threads-list-1512-light.png`.
- Threads are **grouped**: a parent thread can own sub-agent thread groups, rendered as an expandable row (`fraud_review_agent (2)`).

## Purpose

The audit/history surface: every thread, its transcript, and its inspector, without first choosing an agent.

## Layout

Two snap sections instead of three. Section 1 is the thread workspace; section 2 is Structure and appears only once a thread (hence an agent) is selected.

```
+------------------------------------------------------------+ +-------------+
| Threads (2) o  [magnifier] [+] | Messages o        $0.000174| | Structure   |
|--------------------------------|----------------------------| |  ...        |
| order_support_agent   1 day ago|                            | |             |
| 4ae6b87e                       |     [message bubbles]      | |             |
| order_support_agent   1 day ago|                            | |             |
| 540aeabf  [Order R...]         |                            | |             |
|  | fraud_review_agent (2)    > |                            | |             |
|  | inventory_check_agent (3) > |                            | |             |
|                                |  [avatar][clip][composer] >| |             |
+------------------------------------------------------------+ +-------------+
       280px (.threads-col)              flex-1                 ^ Inspector docks
                                                                  right of Messages
```

### Measured chrome (`exact-tokens.md` 3.2 / 3.5)

| Element | Value |
|---|---|
| `.threads-col` | `width: 280px; min-width: 280px`, `transition: width .2s, min-width .2s cubic-bezier(.4,0,.2,1)`; collapsed variant **48px** |
| Column header bar | `px-4 py-3 border-b border-neutral-200` -> `padding 12px 16px` |
| Title / count | `text-base font-bold` 16px/700 `#000` / `text-xs font-mono text-neutral-500` 12px `#737373` |
| Live dot | `w-2 h-2 rounded-full bg-green-500 dark:bg-green-400` -> 8x8, `#00c950` / `#05df72` (driven by socket state) |
| Thread item selected | `rounded-lg px-3 py-2 agents-surface-selected` -> bg `#efe3ff` (dark `#302043`), radius 8px, padding 8px 12px, 264x47, 12px text |
| Thread item idle | `agents-surface-hover`, transparent (hover `#f8f2ff` / `#1c1525`) |
| Sub-agent group row | `w-full rounded-lg text-left px-3 py-1.5 bg-neutral-50/25 dark:bg-neutral-900/10`, accent left rule, trailing chevron |
| Search field (expanded) | same control as the agents search: 1px `#d4d4d4`, radius 8px, height 34px, 14px |

Each thread item shows the agent name, a relative timestamp, the short thread id in `--font-mono`, and an optional tag chip.

## Components used

- `ThreadsPane` + `ThreadListRows` + `SubAgentThreadGroup` - the thread column (the identical component the `/agents` cascade uses)
- `MessagesPane`, `MessageComposer` - the transcript column
- `ThreadInspectorPane` - the inspector, with its tab strip and `...` overflow
- `SearchInputWrapper` - collapsed to a magnifier until clicked
- `TimeAgo` - relative timestamps
- `CreateThreadModal` (via `EditSurfaceHost`) - the `+` button
- `UiEmptyState`, `Loader`, `UiAlertBox` - standard states

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/threads?limit=50&offset=<n>&search=<q>` | On mount; re-fired on search (debounced 300ms) and when the column scrolls near its end | Returns `{ threads: ThreadSummary[], total, hasMore }`. Search is server-side; the column pages by appending, not by a pager control. |
| `GET /api/agents` | On mount (usually warm from `agentsStore` cache) | Agent labels and avatars for the rows. |
| `WS /api/events` | Global socket from shell | `thread_created` / `thread_updated` / `thread_deleted` frames patch the list in place (new threads unshift when no filters are active). |

The selected thread is mirrored into the URL as `/threads/:id` via `router.replace`, so a refresh restores the selection. Search state is `uiStore` only; it is not a URL param in the live app.

## User interactions

1. **Click a thread row** -> `router.replace({ name: "thread-detail", params: { id } })`; Messages and Inspector bind in place. No page transition.
2. **Click the magnifier** -> the search field expands in the header; typing triggers a debounced refetch with `search=<q>`.
3. **Click a sub-agent group row** -> expands the group in place, revealing its child threads indented under the parent.
4. **Scroll the column** -> appends the next page using `hasMore`.
5. **Click `+`** -> `CreateThreadModal` via the uiStore modal stack; on submit `POST /api/threads`, then the new thread is selected.
6. **Live updates:** a `thread_updated` frame for a visible row updates it in place without a refetch.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading** | Initial mount or page append | Skeleton rows (`--animate-pulse`) |
| **Ready** | Results loaded | List rendered |
| **Searching** | Debounced refetch in flight | List stays visible, subtle spinner in the search box |
| **Empty (no threads at all)** | `total: 0`, no search | `UiEmptyState` with "Start a thread" CTA opening `CreateThreadModal` |
| **Inspector too narrow** | Tab strip wider than the inspector | Tabs collapse behind a `...` overflow button (captured at 1512) |
| **Empty (searching)** | `total: 0` with a search term | `UiEmptyState` "No threads match" + clear-search action |
| **Error** | Fetch fails | `UiAlertBox` with retry |
| **Auth expired** | 401 | Global unauthorized handler -> `/login?redirect=/threads` |
| **Live row update** | WS frame for visible thread | In-place badge/count update |

## Theming

- **Row chrome:** rows use `bg-background-soft` with `border-border` separators; hover uses `--agents-accent-surface-hover`, selected-row (if deep-linked) uses `--agents-accent-surface-selected`. All come from the accent token family, so a brand swap recolors interaction states in one place.
- **Status badges:** running / done / terminated / error colors are semantic badge aliases in the theme file (`UiBadge` variants), never literals in the row template.
- **Typography:** agent name in `--font-sans`, thread id in `--font-mono` with muted text color; both follow the theme font tokens.
- **Density:** row padding follows `--spacing`; a compact theme tightens the whole list with one token change.
- **Elevation:** none. Sections are bordered, not shadowed.
- **Full reskin:** switching rows to cards is a template change in `ThreadListRows.vue`; props (thread summaries) and events (row click) stay the same, so this route and the `/agents` cascade both pick it up - they render the *same* component, so they cannot drift.

## Notes

- `/threads` and `/agents` are one shell with a flag for whether the Agents section renders. Do not fork them.
- The thread id is truncated with a `CopyButton` on hover for the full uuid.
- Terminated threads show their `terminated` timestamp in the row tooltip.
