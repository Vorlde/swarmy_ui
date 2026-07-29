# View Spec: AgentsView

- **Route:** `/agents` (name: `agents`)
- **Auth:** Required
- **View component:** `src/views/AgentsView.vue`
- **Stores:** `agentsStore`, `threadsStore` (per-agent thread counts), `uiStore` (filter selection)

## Purpose

The landing view of swarmy_ui. Lists every saved agent composition as a table, lets the user filter by agent type, create a new composition, and open an existing one in the composition canvas at `/agents/:id`. This is the entry point to the composition canvas.

## Layout

Rendered inside the guarded layout (sidebar + main area). The view is a single full-width card in the main scroll area: a header row (title, count, filters, action) above a data table.

### ASCII wireframe

```
+--------+----------------------------------------------------------+
|        |  Agents (3)                          [+ New Agent]       |
| Sidebar|  [ All ] [ AI+Human ] [ Dual AI ]                        |
|  nav   |  +----------------------------------------------------+  |
|        |  | Title              | Threads | Type     | Sides    |  |
|        |  |--------------------+---------+----------+----------|  |
|        |  | fraud_review_agent |   12    | Dual AI  | A risk.. |  |
|        |  |                    |         |          | B cust.. |  |
|        |  | inventory_check... |    3    | Dual AI  | A .. B ..|  |
|        |  | order_support_a... |   27    | AI+Human | A agent  |  |
|        |  +----------------------------------------------------+  |
|        |                                                          |
+--------+----------------------------------------------------------+
```

Row click target spans the full row. A hover ring and pointer cursor indicate clickability.

## Components used

- `DataTable` + `DataTablePagination` - the agents table
- `UiButton` (`variant="primary"`) - "New Agent"
- `UiBadge` - filter chips (`All`, `AI+Human`, `Dual AI`; selected chip uses the accent-selected surface)
- `AgentAvatar` / `AgentLockupCard` (compact row variant) - title cell with icon when the agent has one
- `TimeAgo` - relative created time (tooltip shows absolute)
- `UiEmptyState` - "No agents yet" illustration + CTA when the list is empty
- `AgentModal` (mounted via `EditSurfaceHost`) - create-new-agent dialog
- `Loader` - table skeleton while loading

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/agents` | On mount | Returns `{ agents: AgentSummary[] }` with `id`, `name`, `title`, `type` (`dual_ai`, `ai_human`), `default_prompt`, `default_model`, `tools`, `side_a_label`, `side_b_label`, `side_*_agent_prompt`, `packed`, `created_at`. |
| `GET /api/threads?agent_id=<id>&limit=1` | After agents load, per visible row | Supplies the `Threads` count column (uses `total`). Fired lazily for rows in view, cached in `threadsStore`. |
| `WS /api/events` | While view is mounted (global socket from shell) | `thread_created` / `thread_deleted` frames refresh the count column; agent list refreshes on relevant registry events. |

Filtering by type is client-side over the already-loaded list; there is no server round trip for the chips.

## User interactions

1. **Click a row** -> `router.push({ name: "composition", params: { id: agent.name } })` -> composition canvas (`/agents/:id`).
2. **Click a filter chip** -> narrows the table to `dual_ai` or `ai_human` agents; `All` clears the filter. Selection persisted in `uiStore` so returning to the view restores it.
3. **Click "New Agent"** -> pushes the `AgentModal` create flow onto the uiStore modal stack (`EditSurfaceHost` mounts it). On save, the new agent appears in the table (optimistic insert + list refresh) and the user is offered "Open in canvas".
4. **Search (optional, v1.1):** a `SearchInputWrapper` in the header filters client-side by title substring.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading** | Mount, `/api/agents` in flight | Skeleton rows in `DataTable` |
| **Ready** | Agents loaded, filter applied | Populated table |
| **Empty** | `agents: []` | `UiEmptyState` with "Create your first agent" CTA that opens `AgentModal` |
| **Empty filter result** | Chips/search exclude everything | `UiEmptyState` "No agents match this filter" + clear-filter action |
| **Error** | `/api/agents` fails | `UiAlertBox` above the table with a retry button |
| **Auth expired** | Any 401 | API client unauthorized handler clears the session and routes to `/login?redirect=/agents`; the view does not handle this itself |
| **Counts loading** | Per-row thread count in flight | Count cell shows a muted dash |

## Theming

- **Card and table chrome:** the card uses `bg-background-soft`, `border-border`, `--radius-*`; `DataTable` row hover and header styling come from the `DataTable` feature component's token-based classes. Restyling tables app-wide is a single-component edit.
- **Selected filter chip:** uses `--agents-accent-surface-selected` / `--agents-accent-text`; re-theming the accent family recolors selection everywhere including this chip row.
- **Type badges:** `dual_ai` / `ai_human` badge colors are semantic aliases in the theme file, not literals in the view.
- **Density:** row height and cell padding follow the `--spacing` base unit; a compact theme changes one token.
- **Full reskin:** a card-grid instead of a table is a template swap inside `AgentsView.vue` (compose `AgentLockupCard` in a grid) with zero changes to stores, endpoints, or route wiring.

## Notes

- The view contains route wiring and composition only; all fetching lives in stores. The component never imports `lib/api` directly.
- Agent `type` values observed: `dual_ai`, `ai_human`. Side labels are `null` for `ai_human` agents; render those rows with a single `A` side chip.
