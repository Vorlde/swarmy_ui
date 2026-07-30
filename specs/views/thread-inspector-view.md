# View Spec: ThreadInspectorPane

- **Host:** the third column of cascade section 2, on both `/agents` and `/threads` (deep link `/threads/:id`). It is a **pane**, not a route of its own.
- **Auth:** Required
- **Component:** `src/views/composition/ThreadInspectorPane.vue`
- **Stores:** `threadsStore` (detail + messages), `logsStore`, `agentsStore`, `uiStore` (active tab, pane widths)

## Capture reconciliation

The earlier draft specified a full-page tabbed view with tabs `Messages | Logs | Files | KV Store | Effects | Cost`, a header strip with a back link and stat pills, and `Messages` as the default tab. **The live tab set is different and Messages is not in it.** Corrected against `agents-inspector-{logs,files,kv-store,effects,agent-configuration,thread-settings}-light.png`, `agents-thread2-transcript-2200-light.png`, `threads-list-1512-light.png` and `exact-tokens.md` 3.5:

- **Live tabs, in order:** `Logs` (default) | `Files` | `KV Store` (badge count) | `Effects` | `Agent Configuration` | `Thread Settings`.
- **Messages is a sibling pane**, not a tab - it sits to the left of the inspector inside the same snap section.
- **Cost is not a tab.** The thread total renders as a mono chip in the Messages header (`$0.000174`); per-request cost lives in the log detail panel's stat tiles.
- There is **no header strip** with a back link and stat pills. The inspector's top band is the tab strip and nothing else.
- When the inspector is narrower than the strip, tabs **collapse behind a `...` overflow button**.

## Purpose

The deepest inspection surface after the composition canvas. For one thread it shows LLM request logs, the thread filesystem, its key-value store, scheduled effects, the resolved agent configuration, and the thread's own settings.

## Layout

```
+---------------------------------------------------------------------+
| [Logs] Files  KV Store 1  Effects  Agent Configuration  Thread Set.. |  <- tab strip
+---------------------------------------------------------------------+
| Prompt        Model                  Cost       Tools Called  Called |  <- the ONE real <table>
| order_support deepseek/deepseek-v4.. $0.000174  -             23h ago|
| ...                                                                  |
+---------------------------------------------------------------------+
| < >  (o Success) order_support     [MORPH][model] [Copy cURL]  [x]   |  <- log detail, slides up
| [icons row]                    23 hours ago . finish: stop . log 0b5f|
| +------------+ +------------+ +------------+ +------------+          |
| | PERFORMANCE| | # TOKENS   | | COST       | | CONTEXT    |          |  <- 4 stat tiles
| | 1,150 ms   | | 1,225      | | $0.000174  | | 3 msg      |          |
| +------------+ +------------+ +------------+ +------------+          |
| ^ Request  [v Response]                                              |
| RESPONSE  <text>                                                     |
| Full Response Body   [copy][v]                                       |
| { "id": "res_...", "model": "...", "choices": [                      |
+---------------------------------------------------------------------+
```

### Tab strip (`exact-tokens.md` 3.5)

| Element | Value |
|---|---|
| Tab ACTIVE label | `relative z-10 ... h-8 rounded-md px-2.5 text-sm font-medium text-white` -> 14px / 500, `#fff`, height 32px, padding `0 10px`, `gap 6px`, radius 6px |
| Tab ACTIVE pill | a **separately positioned** `#171717` element rendered *behind* the labels. Because the labels are `relative z-10` and the pill is its own absolutely-positioned box, switching tabs **slides** the pill rather than repainting a tab. Implement it that way. |
| Tab idle | `text-neutral-500` `#737373` |
| Badge | count rendered inline after the label (KV Store shows `1` in the capture) |

### The log list is the only `<table>` in the app

Everything else in this product is a CSS grid (see `specs/components/data-table.md`). The log list is a genuine `<table>`:

| Element | Value |
|---|---|
| `td` | `whitespace-nowrap px-4 py-2 align-middle` -> 12px, padding `8px 16px` |
| Row SELECTED | `agents-surface-selected` -> `#efe3ff` light / `#302043` dark |
| Columns | `Prompt`, `Model`, `Cost`, `Tools Called`, `Called At` (right-aligned) |
| `th` | `px-4 py-2 font-medium`. `exact-tokens.md` records the computed style as `font-size 10px`, `font-weight 500`, `letter-spacing 0.25px`, `text-transform: uppercase`, `color #737373`. **The PNGs disagree on casing and colour:** in `agents-inspector-logs-light.png` and `agents-thread2-transcript-2200-light.png` the labels render title-case (`Prompt`, `Model`, `Cost`, `Tools Called`, `Called At`) in near-`#171717` at roughly 12px/600. Per ADR-009 the pixels win where the two halves of the capture conflict: build the header title-case and dark, and re-measure `th` against a running build before locking the metric values. This is the only known internal conflict in the capture. |

### Log detail panel

- Slides up from the bottom of the inspector (`inspector-slide-up-*` classes). Root: `.log-details-root h-full overflow-y-auto bg-white p-3 dark:bg-neutral-900` -> padding 12px.
- Header: prev/next chevrons, a status pill (`rounded-full`, `border 1px solid #d4d4d4`, `bg #fff`, `padding 2px 8px`, `11px/500`, `gap 6px`, text `oklch(50.8% .118 165.612)` = emerald-700), the prompt name, provider + model chips, `Copy cURL` (`bg #171717`, `#fff`, radius 4px, `padding 4px 12px`, 12px/500), and a close `x`.
- A row of small view-mode icons, and a meta line: relative time, `finish: stop`, truncated log id.
- Four stat tiles: `PERFORMANCE`, `# TOKENS`, `COST`, `CONTEXT`. Tile labels are 10px uppercase muted; tile values are **16px / 600 / `#171717`** with a muted sub-line.
- `Request` / `Response` toggle, then a `RESPONSE` block and a `Full Response Body` `JsonViewer` with copy and collapse controls.
- `log-details-pulse` (`opacity 1 -> .55`, `scale 1 -> 1.25`) marks live/streaming rows.

### Tab panels

Each panel is `role="tabpanel"`, lazily mounted on first activation, and **registered** rather than hardcoded: a tab is `{ id, label, icon, order, component, badge? }` in the `inspectorTabs` registry (`src/plugins/registry.ts`, ADR-008). The inspector renders `orderedInspectorTabs()`. Adding a tab is a plug; `ThreadInspectorPane.vue` is never edited for it.

**Logs** (default) - `LogsPane` + `LogsTable` + `LogDetails`, as described above. Row click opens the detail panel; prev/next step through rows without closing it. Per-provider inspection via `GET /api/threads/:id/logs/:logId/inspect/:provider` when offered. Polls REST by default; upgrades to live tailing when the logs socket is open.

**Files** - `ThreadFilesPane`. Breadcrumb path bar + directory listing from `GET /api/threads/:id/fs` and `GET /api/threads/:id/fs/**`. File click previews content (text in `UiCodeBlock`, binary as download). Upload via `POST /api/threads/:id/fs/**`, delete via `DELETE` on the same path. Empty state: "This thread has no files."

**KV Store** (badge = key count) - `ThreadKvStorePane`. Keys with size, updated time and value preview; response shape `{ values: [{ key, value, serialized, size, updatedAt }], total, limit, offset }`. Row click expands the full value in `JsonViewer`. The `context_usage` key (token usage) gets a highlighted summary row. Add/edit via `POST /api/threads/:id/kv`, clear via `DELETE /api/threads/:id/kv`.

**Effects** - `ThreadEffectsPane`. Scheduled effects with run-at time, status and payload preview. Per effect: `Run now` (`POST /api/threads/:id/effects/:effectId/run`) and `Cancel` (`POST .../cancel`), both with inline confirm. Empty state: "No scheduled effects."

**Agent Configuration** - `ThreadAgentConfigPane`. Read-only projection of the agent document as resolved for this thread (identity, sides, model, tools, hooks, variables). Reuses the property-list components from the canvas inspector so a config restyle lands in both places.

**Thread Settings** - `ThreadSettingsPane`. Captured contents, in order:
1. A `CREATED` / `AGENT` / `TAGS` definition block.
2. A **Watchdog** card: state pill (`STANDING BY`), the most recent watchdog log line (`STOOD DOWN`), and a `Run check now` action.
3. A **Variables** editor for thread-scoped variables.
4. A **Developer Tools** block with `Continue` and `Delete Thread` (`Delete Thread` text is red-600 `#e7000b`, dark red-400 `#ff6467`; goes through `ConfirmDialog`).

Cost has no panel. The thread total is the mono chip in the Messages header; per-request cost is a stat tile in the log detail panel.

## Components used

`LogsPane`, `LogsTable`, `LogDetails`, `LogStatTile`, `ThreadFilesPane`, `ThreadKvStorePane`, `ThreadEffectsPane`, `ThreadAgentConfigPane`, `ThreadSettingsPane`, `WatchdogCard`, `JsonViewer`, `UiCodeBlock`/`CodeBlock`, `CopyButton`, `TimeAgo`, `UiBadge`, `UiButton`, `UiIconButton`, `UiTooltip`, `UiAlertBox`, `UiEmptyState`, `ConfirmDialog` (via `EditSurfaceHost`), `Loader`.

## Data loading

### REST (on mount, in parallel)

| Endpoint | Feeds | Notes |
|---|---|---|
| `GET /api/threads/:id` | Header + status | `{ thread, agent, stats }`. Drives header identity, status badge, and tab badges (`stats.message_count`, `stats.log_count`). |
| `GET /api/threads/:id/messages` | The sibling Messages pane, not this pane | `{ messages, total, hasMore }`. |
| `GET /api/threads/:id/logs` | Logs tab | Eager - Logs is the default tab for every thread, running or terminated. |
| `GET /api/threads/:id/fs` | Files tab | Lazy on first activation. |
| `GET /api/threads/:id/kv` | KV tab + `context_usage` pill | Lazy on first activation; the `context_usage` value also feeds the Cost tab's token bar. |
| `GET /api/threads/:id/effects` | Effects tab | Lazy on first activation. |
| `GET /api/threads/:id/cost` | The Messages-header cost chip | Eager (cheap) so the chip renders immediately. There is no Cost tab. |

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

1. **Switch tabs** - the active pill slides to the new tab; the panel mounts lazily and fetches on first activation. Per-tab scroll and filters live in the store. Active tab synced to `?tab=` (`router.replace`).
2. **Overflow tabs** - when the strip does not fit, the trailing tabs move into a `...` menu; the active tab always stays visible in the strip.
3. **Open a log** (Logs) - the `LogDetails` panel slides up from the bottom; prev/next step through rows; `x` closes it; `Copy cURL` copies the reproduction command.
4. **Browse/upload/delete files** (Files) - as above; destructive file delete goes through `ConfirmDialog`.
5. **Run/cancel an effect** (Effects) - inline confirm, then optimistic status flip with rollback on failure.
6. **Stop the thread** (header) - `POST /api/threads/:id/stop`; status badge flips when the `thread_updated` frame lands.
7. **Delete the thread** (overflow menu) - `ConfirmDialog` -> `DELETE /api/threads/:id` -> navigate back to `/threads`.
8. **Copy thread id / log payloads / KV values** - `CopyButton` throughout.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading detail** | Mount | Header skeleton + tab bar skeleton |
| **Ready** | Detail resolved | Logs tab active, sockets open |
| **Terminated** | `terminated` set | Same tabs; `Thread Settings` offers `Continue`; the sibling composer is disabled with a hint |
| **Log detail open** | A log row selected | Panel slid up over the lower half; selected row on `--agents-accent-surface-selected` |
| **Tab loading** | First activation of a lazy tab | Panel-level spinner, other tabs unaffected |
| **Empty tab** | e.g. `effects: []`, `files: []` | Per-tab `UiEmptyState` |
| **Streaming degraded** | WS reconnect exhausted | Offline indicator in header; REST data stays visible; manual refresh offered |
| **Error (detail)** | `GET /api/threads/:id` fails or 404 | Full-view `UiAlertBox`: "Thread not found" + back link |
| **Error (tab)** | A tab's fetch fails | Inline `UiAlertBox` in that panel with retry; other tabs unaffected |
| **Auth expired** | Any 401 / WS auth failure | Global unauthorized handler -> `/login?redirect=/threads/:id` |
| **Deleted while viewing** | `thread_deleted` frame or 404 on refetch | Route to `/threads` with a dismissible notice |

## Theming

- **Tab strip:** the active pill is neutral `#171717` with white text - **not** accent-tinted. It is its own element behind the labels so it can slide. Badge counts are `UiBadge` variants.
- **Message bubbles:** role colors (user / assistant / tool / system) are semantic aliases (`--agents-accent-surface-message` for assistant bubbles, muted surfaces for tool/system) declared in the theme file, so a conversation restyle is a token edit.
- **Code and JSON:** `CodeBlock`/`UiCodeBlock` use the theme's Shiki highlight pair; `JsonViewer` uses the `--json-key/string/number/boolean/null` token pairs. A new theme re-skins every payload display in this view without touching the panels.
- **Status and cost pills:** badge and pill colors are semantic aliases; the cost pill typography is `--font-mono`.
- **Pane geometry:** panel padding and the composer height follow `--spacing`; nothing is hardcoded in pixels inside panels.
- **Elevation:** none. The detail panel is separated by a border and its slide-up animation, not a shadow.
- **Full reskin:** each tab panel is an independent registered plug with typed props and store-driven data. Swapping the Logs table for a waterfall timeline is a rewrite of `LogsTable.vue` alone; the sockets, stores, tab registry and routing do not change.

## Notes

- This pane is instantiated once and hosted by the cascade on both `/agents` and `/threads`. There is no second, standalone implementation to keep in sync.
- Silent messages are included in the stream subscription (`includeSilent=true`) because they carry persistent thread arguments that explain agent behavior.
- Never poll the messages endpoint while the stream socket is healthy; REST is the snapshot, WS is the delta.
