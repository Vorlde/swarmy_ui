# View Spec: ThreadInspectorView

- **Route:** `/threads/:id` (name: `thread-inspector`)
- **Auth:** Required
- **View component:** `src/views/ThreadInspectorView.vue`
- **Stores:** `threadsStore` (detail + messages), `logsStore` (LLM request logs), `agentsStore` (agent summary for the header), `uiStore` (active tab, pane widths)

## Purpose

The deepest inspection surface in swarmy_ui after the composition canvas. For one thread it shows: the live message stream (chat), LLM request logs, the thread's filesystem, its key-value store, scheduled effects, and cost/token usage. Live threads stream updates over WebSockets; terminated threads render from REST snapshots.

This is a **tabbed inspector**. Tabs: `Messages` | `Logs` | `Files` | `KV Store` | `Effects` | `Cost`. The default tab is `Messages` for a running thread, `Logs` for a terminated one.

## Layout

Guarded layout. A header strip (thread identity + actions) above a tab bar above a tab panel. Each panel is its own feature component (`role="tabpanel"`), lazily mounted the first time its tab is activated.

### ASCII wireframe

```
+--------+----------------------------------------------------------------+
|        | <- Threads   fraud_review_agent / 5b7d70b6.. [Copy] [Stop v]  |
| Sidebar|  Status: TERMINATED   9 messages   4 logs   $0.000556   2h ago |
|  nav   | +--------------------------------------------------------------+
|        | | Messages | Logs (4) | Files | KV Store (2) | Effects | Cost |
|        | +--------------------------------------------------------------+
|        | |                                                              |
|        | |   [active tab panel, role="tabpanel"]                        |
|        | |                                                              |
|        | |                                                              |
|        | +--------------------------------------------------------------+
+--------+----------------------------------------------------------------+
```

Header contents:

- Back link to `/threads` (preserves list filters via URL).
- Agent name (links to `/agents/:agentId`) + truncated thread id with `CopyButton`.
- Status badge (`RUNNING` / `DONE` / `TERMINATED` / `ERROR`).
- Stat pills: message count, log count, cost (`ThreadUsageCostCard` compact).
- Actions: `Stop` (`POST /api/threads/:id/stop`, running threads only), overflow menu with `Delete` (`DELETE /api/threads/:id`, `ConfirmDialog`), `Revive` (`POST /api/threads/:id/revive`, terminated only).

### Tab panels

**Messages** (`MessagesPane` + `AgentMessages` + `MessageComposer`)

```
+------------------------------------------------------------------+
| [user]                                    2h ago                 |
|  { "orderId": "A-1002" }                                         |
|------------------------------------------------------------------|
| [assistant] Risk Analyst                          $0.0002  2h ago|
|  tool call: check_customer_history({...})                        |
|------------------------------------------------------------------|
| [tool] check_customer_history                                    |
|  { "history": [...] }                                 [JSON]     |
|------------------------------------------------------------------|
| [system] SILENT                                                  |
|  persistent thread arguments                                     |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| | Message the thread...                              [Send]    | |
| +--------------------------------------------------------------+ |
```

- Renders `user`, `assistant`, `tool`, `system` roles. `silent: true` messages carry a `SILENT` `UiBadge`.
- Tool calls render the call name + args; tool results render JSON via `JsonViewer`.
- Reasoning content (`reasoning_content`) collapses behind a disclosure.
- Cost pill per assistant message when `log_id` is resolvable.
- `MessageComposer` posts `POST /api/threads/:id/messages` `{ content, role: "user" }`; disabled with an explanatory hint when the thread is terminated.
- Auto-scroll pinned to bottom unless the user scrolls up; "jump to latest" pill appears when unpinned.

**Logs** (`LogsPane` + `LogsTable` + `LogDetails`)

- Table of LLM requests: time, provider/model, tokens in/out, cost, latency, status.
- Row click expands `LogDetails`: full request/response JSON in `JsonViewer`, plus per-provider inspect via `GET /api/threads/:id/logs/:logId/inspect/:provider` when available.
- Polls REST by default; upgrades to live tailing when the logs socket is open.

**Files** (`ThreadFilesPane`)

- Breadcrumb path bar + directory listing from `GET /api/threads/:id/fs` and `GET /api/threads/:id/fs/**` for subpaths.
- File click previews content (text in `CodeBlock`/`UiCodeBlock`, binary as download). Upload via `POST /api/threads/:id/fs/**`, delete via `DELETE` on the same path.
- Empty state: "This thread has no files."

**KV Store** (`ThreadKvStorePane`)

- Table of keys: key, size, updated time, value preview. Response shape: `{ values: [{ key, value, serialized, size, updatedAt }], total, limit, offset }`.
- Row click expands the full value in `JsonViewer`. `context_usage` key (token usage) gets a highlighted summary row.
- Add/edit via `POST /api/threads/:id/kv`, clear via `DELETE /api/threads/:id/kv`.

**Effects** (`ThreadEffectsPane`)

- List of scheduled effects with run-at time, status, and payload preview.
- Actions per effect: `Run now` (`POST /api/threads/:id/effects/:effectId/run`) and `Cancel` (`POST .../cancel`), both with inline confirm.
- Empty state: "No scheduled effects."

**Cost** (`ThreadUsageCostCard` full variant)

- Totals from `GET /api/threads/:id/cost`: `totalCost`, `inputCost`, `cachedCost`, `outputCost`, `requestCount`, `messageCount`, `avgCostPerMessage`.
- `modelBreakdown` rendered as a per-model table (requests, tokens, cost). `threads` subtotal shown when the thread has children.
- Token usage bar from the `context_usage` KV entry when present.

## Components used

`MessagesPane`, `AgentMessages`, `MessageComposer`, `LogsPane`, `LogsTable`, `LogDetails`, `ThreadFilesPane`, `ThreadKvStorePane`, `ThreadEffectsPane`, `ThreadUsageCostCard`, `ThreadBasicInfoCard` (header stats), `JsonViewer`, `UiCodeBlock`/`CodeBlock`, `CopyButton`, `TimeAgo`, `UiBadge`, `UiButton`, `UiIconButton`, `UiTooltip`, `UiAlertBox`, `UiEmptyState`, `ConfirmDialog` (via `EditSurfaceHost`), `Loader`.

## Data loading

### REST (on mount, in parallel)

| Endpoint | Feeds | Notes |
|---|---|---|
| `GET /api/threads/:id` | Header + status | `{ thread, agent, stats }`. Drives header identity, status badge, and tab badges (`stats.message_count`, `stats.log_count`). |
| `GET /api/threads/:id/messages` | Messages tab | `{ messages, total, hasMore }`. Fired on mount (Messages is default for running threads). |
| `GET /api/threads/:id/logs` | Logs tab | Lazy: first activation of the Logs tab (or on mount when the thread is terminated, since Logs is then the default). |
| `GET /api/threads/:id/fs` | Files tab | Lazy on first activation. |
| `GET /api/threads/:id/kv` | KV tab + `context_usage` pill | Lazy on first activation; the `context_usage` value also feeds the Cost tab's token bar. |
| `GET /api/threads/:id/effects` | Effects tab | Lazy on first activation. |
| `GET /api/threads/:id/cost` | Cost tab + header cost pill | Eager (cheap) so the header pill renders immediately. |

Each tab fetches once per thread id and caches in its store; revisiting a tab does not refetch unless the user hits refresh or a WS invalidation arrives.

### WebSockets (opened when the thread is loaded, closed on unmount)

| Socket | Frames handled | Effect |
|---|---|---|
| `WS /api/threads/:id/stream?token=...&includeSilent=true` | message created/updated | Appends/patches messages in `MessagesPane`; updates header message count; scrolls if pinned. |
| `WS /api/threads/:id/logs?token=...` | log appended | Appends a row in `LogsTable`; increments the Logs tab badge. |
| `WS /api/events?token=...` (global, from shell) | `thread_updated` / `thread_deleted` for this id | Updates the status badge (e.g. RUNNING -> TERMINATED); deleted routes back to `/threads` with a notice. |

Connection rules:

- Sockets open only after `GET /api/threads/:id` resolves (need the id validated and status known).
- For a terminated thread, the stream socket still opens but is expected to be quiet; do not show a "connecting" state forever - treat socket open as ready and REST data as the source of truth.
- Exponential backoff reconnect (1s -> 30s cap) with an offline indicator in the header after 3 failed attempts. A manual refresh action refetches REST snapshots.
- Auth token is passed as the `?token=` query param on upgrade URLs.

## User interactions

1. **Switch tabs** - mounts the panel lazily, fetches on first activation, preserves per-tab scroll/filters in the store. Active tab synced to `?tab=` query param (`router.replace`) for deep links.
2. **Send a message** (Messages) - composer submit -> 202 queued; optimistic bubble marked "queued" until the stream frame confirms.
3. **Expand a log** (Logs) - inline `LogDetails` drawer; inspect-per-provider when offered.
4. **Browse/upload/delete files** (Files) - as above; destructive file delete goes through `ConfirmDialog`.
5. **Run/cancel an effect** (Effects) - inline confirm, then optimistic status flip with rollback on failure.
6. **Stop the thread** (header) - `POST /api/threads/:id/stop`; status badge flips when the `thread_updated` frame lands.
7. **Delete the thread** (overflow menu) - `ConfirmDialog` -> `DELETE /api/threads/:id` -> navigate back to `/threads`.
8. **Copy thread id / log payloads / KV values** - `CopyButton` throughout.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading detail** | Mount | Header skeleton + tab bar skeleton |
| **Ready (running)** | Detail resolved, `terminated: null` | Live badges, composer enabled, sockets open |
| **Ready (terminated)** | `terminated` set | Default tab Logs, composer disabled with hint, `Revive` action available |
| **Tab loading** | First activation of a lazy tab | Panel-level spinner, other tabs unaffected |
| **Empty tab** | e.g. `effects: []`, `files: []` | Per-tab `UiEmptyState` |
| **Streaming degraded** | WS reconnect exhausted | Offline indicator in header; REST data stays visible; manual refresh offered |
| **Error (detail)** | `GET /api/threads/:id` fails or 404 | Full-view `UiAlertBox`: "Thread not found" + back link |
| **Error (tab)** | A tab's fetch fails | Inline `UiAlertBox` in that panel with retry; other tabs unaffected |
| **Auth expired** | Any 401 / WS auth failure | Global unauthorized handler -> `/login?redirect=/threads/:id` |
| **Deleted while viewing** | `thread_deleted` frame or 404 on refetch | Route to `/threads` with a dismissible notice |

## Theming

- **Tab strip:** active tab indicator uses `--agents-accent-surface-selected` and `--agents-accent-text`; hover uses the accent hover surface. Badge counts are `UiBadge` variants.
- **Message bubbles:** role colors (user / assistant / tool / system) are semantic aliases (`--agents-accent-surface-message` for assistant bubbles, muted surfaces for tool/system) declared in the theme file, so a conversation restyle is a token edit.
- **Code and JSON:** `CodeBlock`/`UiCodeBlock` use the theme's Shiki highlight pair; `JsonViewer` uses the `--json-key/string/number/boolean/null` token pairs. A new theme re-skins every payload display in this view without touching the panels.
- **Status and cost pills:** badge and pill colors are semantic aliases; the cost pill typography is `--font-mono`.
- **Pane geometry:** panel padding and the composer height follow `--spacing`; nothing is hardcoded in pixels inside panels.
- **Full reskin:** each tab panel is an independent feature component with typed props and store-driven data. Swapping, say, the Logs table for a waterfall timeline is a rewrite of `LogsTable.vue` alone; the sockets, stores, and route wiring do not change.

## Notes

- The same inspector components (`ThreadListPane` + inspector panels) are reused inside the composition shell's threads card; this view is the standalone full-page host. Keep all behavior in the shared components so both hosts stay in sync.
- Silent messages are included in the stream subscription (`includeSilent=true`) because they carry persistent thread arguments that explain agent behavior.
- Never poll the messages endpoint while the stream socket is healthy; REST is the snapshot, WS is the delta.
