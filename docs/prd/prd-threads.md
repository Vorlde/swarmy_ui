# PRD: Threads

Feature area: thread inspector, messages, logs, filesystem, kv, effects, cost.

## User stories

- As an operator, I can see all threads with status, agent, and timestamps,
  updating live as threads are created/updated/deleted.
- As an operator, I can open a thread and read its full message history.
- As an operator, I can send a message into a thread and see streamed
  responses in real time.
- As an operator, I can inspect thread logs and tail them live.
- As an operator, I can browse the thread's filesystem and read/edit files.
- As an operator, I can view and edit the thread's KV store.
- As an operator, I can see pending effects and run or cancel them.
- As an operator, I can see the cost breakdown of a thread.
- As an operator, I can stop, continue, or revive a thread.

## Functional requirements

1. ThreadsView: paginated, searchable DataTable of threads (filter by agent,
   date range); live updates via the `/api/events` WebSocket
   (`thread_created`, `thread_updated`, `thread_deleted`).
2. ThreadInspectorPane embedded in the Threads card of CompositionView and
   reachable from ThreadsView, with tabs: Logs, Files, KV Store, Effects,
   Config; plus a Messages view and a Cost display.
3. Messages: full history, per-message edit/delete, composer with
   attachments and a silent flag, real-time updates via
   `/api/threads/:id/stream`.
4. Logs: list with detail view, per-log provider inspection, optional live
   tail via the logs WebSocket upgrade.
5. Files: filesystem browser (list, read, create/upload, delete) with a
   Monaco editor for text files.
6. KV Store: list keys, read/create/update values, clear the store.
7. Effects: list pending effects; run or cancel an effect.
8. Cost: token/cost breakdown for the thread.
9. Lifecycle: stop, continue, revive actions; pending tool calls list;
   subagents list.

## Non-functional requirements

- WebSocket connections must be scoped to the visible thread and torn down on
  navigation.
- Streaming message rendering must stay smooth (batched updates).
- All tabs share the pane shell so tab appearance is swappable in one place.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET/POST | `/api/threads` | List (paged, filtered) / create thread |
| GET/PATCH/DELETE | `/api/threads/:id` | Detail / update / delete |
| GET/POST | `/api/threads/:id/messages` | Message history / post message |
| PATCH/DELETE | `/api/threads/:id/messages/:messageId` | Edit / delete message |
| GET | `/api/threads/:id/logs`, `/logs/:logId` | Logs and log detail |
| GET | `/api/threads/:id/logs/:logId/inspect/:provider` | Inspect a log with a provider |
| GET/POST/DELETE | `/api/threads/:id/fs/**` | Filesystem browse/read/write/delete |
| GET/POST/DELETE | `/api/threads/:id/kv` | KV store read/write/clear |
| GET | `/api/threads/:id/effects` | List effects |
| POST | `/api/threads/:id/effects/:effectId/run` / `cancel` | Run / cancel an effect |
| GET | `/api/threads/:id/cost` | Cost breakdown |
| GET | `/api/threads/:id/diagnostics` | Thread diagnostics |
| GET | `/api/threads/:id/subagents` | Subagents |
| GET | `/api/threads/:id/pending-tool-calls` | Pending tool calls |
| POST | `/api/threads/:id/stop` / `continue` / `revive` | Lifecycle actions |
| WS | `/api/events` | Global thread registry events |
| WS | `/api/threads/:id/stream` | Live message stream |
| WS | `/api/threads/:id/logs` | Live log tailing (optional upgrade) |

## Acceptance criteria

- Threads list updates live when a thread is created, updated, or deleted,
  without polling.
- Opening a thread shows messages; posting a message streams the response
  into the view in real time.
- Each inspector tab loads its data lazily and shows loading/empty states.
- A file can be opened, edited in Monaco, and saved back to the thread fs.
- A KV entry can be created, edited, and the store cleared with a confirm
  dialog.
- An effect can be run and canceled; the list reflects the change.
- Cost renders an itemized breakdown.
- Stop/continue/revive reflect immediately in the thread status.
- Leaving the thread closes its WebSocket connections.
