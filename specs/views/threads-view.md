# View Spec: ThreadsView

- **Route:** `/threads` (name: `threads`)
- **Auth:** Required
- **View component:** `src/views/ThreadsView.vue`
- **Stores:** `threadsStore`, `agentsStore` (agent filter options), `uiStore` (filter/search state)

## Purpose

A searchable, filterable list of every thread across all agents. Each row summarizes a thread; clicking a row navigates to `/threads/:id` where the thread inspector opens (see `thread-inspector-view.md`). This view is the audit/history surface of swarmy_ui.

## Layout

Guarded layout. Header row with title, search box, agent filter, and date filter above a thread list. Rows are full-width list items (not a dense table) with a status indicator, agent name, truncated id, relative time, and message count.

### ASCII wireframe

```
+--------+----------------------------------------------------------+
|        |  Threads                                    [+ New]      |
| Sidebar|  +------------------+ +--------------+ +---------------+ |
|  nav   |  | Search threads.. | | Agent: All v | | Date: Any v   | |
|        |  +------------------+ +--------------+ +---------------+ |
|        |  +----------------------------------------------------+  |
|        |  | o RUNNING  order_support_agent   3f9a1c..  2m ago  |  |
|        |  |            14 messages                        >     |  |
|        |  |----------------------------------------------------|  |
|        |  | o DONE     fraud_review_agent    5b7d70..  2h ago  |  |
|        |  |            9 messages                         >     |  |
|        |  |----------------------------------------------------|  |
|        |  | o DONE     inventory_check_...   540aea..  1d ago  |  |
|        |  |            7 messages                         >     |  |
|        |  +----------------------------------------------------+  |
|        |        [< Prev]   Page 1 of 4   [Next >]               |
+--------+----------------------------------------------------------+
```

## Components used

- `ThreadListPane` + `ThreadListRows` - the thread list (shared with the threads card in the composition shell)
- `SearchInputWrapper` - full-text search box
- `SelectInput` / `SelectInputWrapper` - agent filter dropdown
- `DateFilterDropdown` - start/end date filter
- `UiBadge` - thread status (running / done / terminated / error)
- `TimeAgo` - relative timestamps
- `CreateThreadModal` (via `EditSurfaceHost`) - new thread dialog (agent picker + initial message)
- `DataTablePagination` - pager (offset/limit based)
- `UiEmptyState`, `Loader`, `UiAlertBox` - standard states

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/threads?limit=50&offset=<n>&search=<q>&agent_id=<a>&startDate=<unix>&endDate=<unix>` | On mount; re-fired on search (debounced 300ms), filter change, page change | Returns `{ threads: ThreadSummary[], total, hasMore }`. All filtering is server-side. |
| `GET /api/agents` | On mount (usually warm from `agentsStore` cache) | Populates the agent filter dropdown. |
| `WS /api/events` | Global socket from shell | `thread_created` / `thread_updated` / `thread_deleted` frames patch the list in place (new threads unshift when no filters are active). |

Query params `?agent_id=`, `?search=` are mirrored into the URL via `router.replace` so a refresh restores the filter state.

## User interactions

1. **Click a thread row** -> `router.push({ name: "thread-inspector", params: { id } })` -> `/threads/:id`.
2. **Type in search** -> debounced refetch with `search=<q>`; pagination resets to offset 0.
3. **Pick an agent** in the dropdown -> refetch scoped by `agent_id`.
4. **Pick a date range** -> refetch with `startDate`/`endDate`.
5. **Paginate** -> offset paging using `total` / `hasMore`.
6. **Click "+ New"** -> `CreateThreadModal` via the uiStore modal stack; on submit `POST /api/threads` with `{ agent_id, initial_messages }`, then navigate to the new thread's inspector.
7. **Live updates:** a `thread_updated` frame for a visible row updates its status badge and message count without a refetch.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading** | Initial mount or page change | Skeleton rows |
| **Ready** | Results loaded | List rendered |
| **Searching** | Debounced refetch in flight | List stays visible, subtle spinner in the search box |
| **Empty (no threads at all)** | `total: 0`, no filters | `UiEmptyState` with "Start a thread" CTA opening `CreateThreadModal` |
| **Empty (filtered)** | `total: 0` with filters active | `UiEmptyState` "No threads match" + clear-filters action |
| **Error** | Fetch fails | `UiAlertBox` with retry |
| **Auth expired** | 401 | Global unauthorized handler -> `/login?redirect=/threads` |
| **Live row update** | WS frame for visible thread | In-place badge/count update |

## Theming

- **Row chrome:** rows use `bg-background-soft` with `border-border` separators; hover uses `--agents-accent-surface-hover`, selected-row (if deep-linked) uses `--agents-accent-surface-selected`. All come from the accent token family, so a brand swap recolors interaction states in one place.
- **Status badges:** running / done / terminated / error colors are semantic badge aliases in the theme file (`UiBadge` variants), never literals in the row template.
- **Typography:** agent name in `--font-sans`, thread id in `--font-mono` with muted text color; both follow the theme font tokens.
- **Density:** row padding follows `--spacing`; a compact theme tightens the whole list with one token change.
- **Full reskin:** switching rows to cards or a dense table is a template change in `ThreadListRows.vue`; props (thread summaries) and events (row click) stay the same, so this view and the composition shell's threads card both pick it up.

## Notes

- All filtering is server-side; the list view never holds more than one page of threads.
- The thread id cell is truncated with a `CopyButton` on hover for the full uuid.
- Terminated threads show their `terminated` timestamp in the row tooltip.
