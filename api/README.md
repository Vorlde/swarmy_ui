# swarmy_ui API

The backend exposes 132 endpoints (HTTP + WebSocket), all prefixed with
`/api`. This folder summarizes the contract by domain. The machine-readable
contract and the typed client are the authoritative sources.

## Authoritative sources

- Full machine-readable contract: `api/contract/api-contract.json`
- Typed TypeScript client (132/132 endpoints): `api/client/`
  (`client.ts`, `types.ts`, `schemas.ts`, `stream.ts`, `index.ts`)

## Endpoints by domain

| Domain | Count | Base paths |
|--------|-------|------------|
| agents | 3 | `GET /api/agents`, `GET /api/agents/:name`, `GET /api/agents/:name/tenvs` |
| api-keys | 3 | `GET/POST /api/api-keys`, `DELETE /api/api-keys/:id` (hosted only) |
| auth | 13 | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/config`, bootstrap, device flow, platform replica/cleanup, OAuth start/callback |
| platform-auth | 4 | `/api/platform-auth/login|logout|me|bootstrap` |
| config | 3 | `GET /api/config`, `GET/PATCH /api/envs/instance` |
| diagnostics | 2 | `GET /api/diagnostics`, `GET /api/new-test` |
| hooks | 1 | `GET /api/hooks` |
| marketplace (platform proxy) | 11 | `/api/platform/**`, `/api/platform-session/**`, `GET /api/platform-endpoint` |
| models | 6 | `GET /api/models`, `GET /api/models/:name`, `curl-data`, `POST available|capabilities|endpoints` |
| pack/unpack | 8 | `POST /api/pack/:agentName`, `analyze`, `metadata`, `packed-info`, `publish`, `npm-token-status`, `POST /api/unpack/:packageId`, `analyze` |
| prompts | 3 | `GET /api/prompts`, `GET /api/prompts/:name`, `GET /api/prompts/:name/tenvs` |
| providers | 3 | `GET /api/providers`, `:name/icon`, `:name/tools` |
| root | 1 | `POST /api/` (dev/test hello-world) |
| skills | 6 | `GET/POST /api/skills`, `GET/PATCH/DELETE /api/skills/:name`, `GET /api/skills/:name/files/**` |
| streaming | 1 | `GET /api/events` (WebSocket: global thread registry events) |
| threads | 35 | `/api/threads` CRUD, messages, logs, fs, kv, effects, cost, diagnostics, subagents, stream, bridge, rpc, stop/continue/revive, pending-tool-calls, variables |
| tools | 2 | `GET /api/tools`, `GET /api/tools/:name` |
| users | 24 | `/api/users` CRUD, `/api/users/me/**`, env, kv, stream, hub |
| variables | 3 | `GET /api/variables/agents|prompts|tools/:name` |

## WebSocket endpoints (7)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/events` | Global thread registry events (`thread_created`, `thread_updated`, `thread_deleted`) |
| `GET /api/threads/:id/stream` | Real-time message updates for chat UI |
| `GET /api/threads/:id/bridge` | Client-tool bridge (filesystem/shell forwarding; hosted only) |
| `GET /api/threads/:id/logs` | Optional WS upgrade for live log tailing |
| `GET /api/users/me/stream` | Per-user event stream |
| `GET /api/users/:id/stream` | Admin view of a user's event stream |
| `GET /api/users/me/hub` | Persistent hub socket for machine daemon wake signals |

All require the `Upgrade: websocket` header. Auth is required on hosted
deployments; several thread routes are public in local dev.

## Auth model

- Bearer token from `POST /api/auth/login` (`{ username?, password }` ->
  `{ token, user }`).
- Token sent as `Authorization: Bearer <token>` on all authenticated calls.
- `GET /api/auth/me` validates the session on app boot.
- Any 401 response triggers a global redirect to `/login`.

## Usage notes

- The UI should call endpoints exclusively through the typed client in
  `api/client/`; do not hand-write `fetch` calls in components.
- Zod schemas in `schemas.ts` validate key payloads at the boundary.
- `stream.ts` provides the WebSocket helpers for events, thread stream,
  and thread logs.
- Known deltas: `/api/auth/oauth/github|google` and
  `/api/models/:id/fallbacks` appear in the UI surface but have no dedicated
  backend route; model fallbacks are embedded in the `GET /api/models`
  payload.
