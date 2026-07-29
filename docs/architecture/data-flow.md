# swarmy_ui - Data Flow

How data moves through swarmy_ui: API client -> stores -> components -> views, and back. Plus the WebSocket streaming flows.

## 1. The One Rule

**Only stores talk to the network.** Components read reactive store state and call store actions. Views never call `fetch`, the API client, or the WebSocket manager directly. This keeps the entire UI layer replaceable: a new skin mounts on the same stores and sees identical data.

```mermaid
flowchart LR
    B["Backend /api/*"]
    C["API Client (lib/api)"]
    W["WS Manager (lib/ws)"]
    S["Stores (reactive state + actions)"]
    V["Views / Components"]

    B <--> C
    B <--> W
    C --> S
    W --> S
    S --> V
    V -->|"user intent -> store action"| S
```

## 2. REST flow (read)

```mermaid
sequenceDiagram
    participant V as View (e.g. ModelsView)
    participant S as modelsStore
    participant C as API client
    participant B as Backend

    V->>S: onMounted -> actions.loadModels()
    S->>S: state.loading = true
    S->>C: api.models.list()
    C->>B: GET /api/models (Authorization: Bearer)
    B-->>C: 200 { models: ModelSummary[] }
    C-->>S: typed result
    S->>S: state.models = result; loading = false
    S-->>V: reactive re-render (computed selectors)
```

Notes:

- Errors are normalized in the client into `ApiError { status, code, message }`. Stores catch and write `state.error`; views render `UiAlertBox` from it.
- A 401 from any `/api/*` call (except `/api/auth/*`) triggers the global unauthorized handler: clear token, redirect to login.
- List endpoints are paginated (`limit`/`offset` or `page`/`perPage`); stores keep the pagination cursor, not components.

## 3. REST flow (write)

```mermaid
sequenceDiagram
    participant V as MessageComposer
    participant S as threadsStore
    participant C as API client
    participant B as Backend

    V->>S: actions.sendMessage(threadId, { content, role: "user" })
    S->>S: optimistic append (pending: true)
    S->>C: api.threads.messages.send(threadId, payload)
    C->>B: POST /api/threads/:id/messages
    B-->>C: 202 queued
    S->>S: mark message queued
    Note over S,B: authoritative message arrives via WS stream
```

Writes are optimistic where the UI benefits (messages, variable edits), with the WebSocket stream as the source of truth that reconciles.

## 4. Auth flow

```mermaid
sequenceDiagram
    participant L as LoginView
    participant A as authStore
    participant C as API client
    participant B as Backend
    participant R as Router

    L->>A: actions.login(username, password)
    A->>C: api.auth.login(...)
    C->>B: POST /api/auth/login
    B-->>C: 200 { token, user }
    A->>A: persist token (localStorage), set user
    A->>R: push(redirect ?? { name: "agents" })
    Note over A,B: All subsequent requests carry Authorization: Bearer <token>
```

Session check: on boot and on every guarded navigation, `authStore.checkSession()` calls `GET /api/auth/me`. The result is cached per boot to avoid a request storm.

## 5. WebSocket streaming flows

The WS manager owns connections: one socket per endpoint, exponential-backoff reconnect, topic-based fan-out to stores. Auth token is sent during the upgrade handshake.

### 5a. Thread message stream

```mermaid
sequenceDiagram
    participant M as MessagesPane
    participant S as threadsStore
    participant W as WS manager
    participant B as Backend

    M->>S: selectThread(id)
    par history + live
        S->>B: GET /api/threads/:id/messages
        B-->>S: Message[] (history)
    and
        S->>W: subscribe(`thread:${id}`)
        W->>B: WS GET /api/threads/:id/stream
        loop frames
            B-->>W: { type: "message", ... }
            W-->>S: dispatch -> append/patch message
            S-->>M: reactive render
        end
    end
    M->>S: deselect (route change)
    S->>W: unsubscribe(`thread:${id}`) -> close if no subscribers
```

### 5b. Global events stream (thread registry)

```mermaid
sequenceDiagram
    participant T as ThreadListPane
    participant S as threadsStore
    participant W as WS manager
    participant B as Backend

    Note over W,B: opened once after login
    W->>B: WS GET /api/events
    loop frames
        B-->>W: thread_created | thread_updated | thread_deleted
        W-->>S: dispatch
        S->>S: patch thread list in place
        S-->>T: reactive list update (no refetch)
    end
```

### 5c. Other streams

| Endpoint | Store | Use |
|----------|-------|-----|
| `/api/threads/:id/bridge` | threadsStore (hosted only) | Client-tool bridge: forward tool calls to a connected CLI |
| `/api/users/me/stream` | uiStore | Per-user notifications and state frames |
| `/api/users/:id/stream` | usersStore | Admin observation of a user stream |
| `/api/users/me/hub` | uiStore | Persistent hub socket for daemon wake signals |

### 5d. Logs

Logs are REST-first: `GET /api/threads/:id/logs` polled on an interval while LogsPane is visible (with `DateFilterDropdown` range). The endpoint supports an optional WS upgrade for live tailing; the pane switches to it when permission allows. `LogDetails` fetches `/api/threads/:id/logs/:logId` (and `/inspect/:provider`) on demand.

## 6. CompositionView load flow

The heaviest view. Everything loads in parallel on mount; the canvas renders as soon as the layout inputs resolve.

```mermaid
sequenceDiagram
    participant CV as CompositionView
    participant AG as agentsStore
    participant MD as modelsStore
    participant CT as catalogsStore
    participant TH as threadsStore
    participant B as Backend

    CV->>AG: loadAgents()
    CV->>MD: loadModels()
    CV->>CT: loadCatalogs()
    par fan-out
        AG->>B: GET /api/agents
        MD->>B: GET /api/models
        CT->>B: GET /api/tools
        CT->>B: GET /api/hooks
        CT->>B: GET /api/prompts
        CT->>B: GET /api/providers
    end
    CV->>TH: countThreads(agent) for each agent
    TH->>B: GET /api/threads?agent_id=<name>&limit=1
    CV->>AG: buildLayout(agent, sides, subagents, models, tools)
    AG-->>CV: CompositionLayout { nodes, edges, groups, bounds }
    Note over CV: ?thread & ?agent query params select nodes/thread
```

## 7. URL synchronization

Deep-link state (`?agent=`, `?thread=` on `/agents`) is synced both ways:

- Route -> store: on navigation, stores read query params and select the agent/thread.
- Store -> route: selection changes call `router.replace({ query })` (never `push`, to avoid history spam).

The draft thread sentinel `__draft_new_thread__` appears in the URL for unsaved threads.

## 8. Store inventory and their endpoints

| Store | Reads | Writes | Streams |
|-------|-------|--------|---------|
| authStore | `/api/auth/me`, `/api/auth/config`, `/api/auth/bootstrap` | `/api/auth/login`, `/api/auth/logout` | - |
| agentsStore | `/api/agents`, `/api/agents/:name`, `/api/agents/:name/tenvs`, `/api/variables/agents/:name` | via pack/unpack | `/api/events` |
| threadsStore | `/api/threads*`, `/api/threads/:id/{messages,logs,cost,effects,kv,fs,subagents,...}` | create/patch/delete thread, messages, effects run/cancel, stop, continue, revive, kv, fs | `/api/threads/:id/stream`, `/api/threads/:id/bridge`, `/api/events` |
| modelsStore | `/api/models*`, `/api/providers`, `/api/providers/:name/tools` | `/api/models/available`, `/api/models/capabilities`, `/api/models/endpoints` | - |
| catalogsStore | `/api/prompts*`, `/api/tools*`, `/api/hooks`, `/api/skills*` | prompts/tools/skills CRUD | - |
| marketplaceStore | `/api/pack/:agentName/{analyze,metadata,packed-info}`, `/api/unpack/:packageId/analyze`, `/api/platform/**` | `/api/pack/:agentName`, `/publish`, `/api/unpack/:packageId` | - |
| usersStore | `/api/users*` | users CRUD, env patch | `/api/users/me/stream`, `/api/users/:id/stream`, `/api/users/me/hub` |
| variablesStore | `/api/users/me/env`, `/api/envs/instance` | PATCH env endpoints | - |
| uiStore | - | - | notifications from `/api/users/me/stream` |
