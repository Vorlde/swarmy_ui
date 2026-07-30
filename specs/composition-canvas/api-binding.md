# Composition Canvas - API Binding

Project: **swarmy_ui**. All endpoints are relative to the swarmy_ui backend (`/api/...`). Auth is a session cookie from `POST /api/auth/login`; the client verifies with `GET /api/auth/me` and redirects to `/login` on 401. Of the 132 endpoints in the API contract, the Composition Canvas surface uses the following.

## 1. Load lifecycle

| Phase | Endpoint(s) | When | Consumer |
|---|---|---|---|
| Catalog | `GET /api/agents` | View mount; after any agent create/pack/unpack | AgentBrowserPanel, CompositionView |
| Catalog | `GET /api/models` | View mount; after model save | layout generator, ModelNode |
| Catalog | `GET /api/tools` | View mount; after tool save | layout generator, ToolNode |
| Catalog | `GET /api/hooks` | View mount | structure tree / inspector only - hooks produce **no** canvas node |
| Agent detail | `GET /api/agents/{name}` | On agent select (`?agent=` query param) or default first agent | CompositionView -> layout generator |
| Prompt detail | `GET /api/prompts/{name}` | Per side prompt referenced by the selected agent (side A/B), and per prompt-tool | SidePromptNode, PromptCard, InspectorPanel |
| Tool detail | `GET /api/tools/{toolName}` | Lazy, when a ToolNode first renders or is expanded | ToolNode, FunctionToolCard |
| Provider icon | `GET /api/providers/{provider}/icon?model={model}` | Per unique provider+model rendered | ModelNode, PromptCard, SidePromptNode, ToolNode |
| Providers | `GET /api/providers` | On model edit open | InspectorPanel (model tab) |

Sequence on mount: catalogs in parallel -> pick agent -> agent detail + its prompts in parallel -> compute layout -> render -> measure -> fitToView.

Sub-agent references additionally require recursive agent + prompt detail fetches, since each sub-agent
renders a full SUB-AGENT card plus its own inner prompt/function nodes inside a group.

## 2. Pack / Unpack / Publish

These are launched from the kebab (`...`) menu on an Agents-list row (`Edit / Pack / Delete`), not from a
canvas toolbar - the Structure pane has no toolbar.

| Endpoint | Method | When | Consumer |
|---|---|---|---|
| `/api/pack/{id}/analyze` | GET | PackModal opens | PackModal, DependencyTree |
| `/api/pack/{id}/metadata` | GET | PackModal opens (package name/version suggestions) | PackModal |
| `/api/pack/{id}` | POST | User confirms pack | PackModal |
| `/api/unpack/{packageId}/analyze` | GET | UnpackModal opens | UnpackModal, UnpackTree |
| `/api/unpack/{packageId}` | POST | User confirms unpack | UnpackModal |
| `/api/pack/{packageId}/packed-info` | GET | After unpack analyze / when showing packed agent badge | UnpackModal, AgentLockupCard |
| `/api/pack/npm-token-status` | GET | PublishModal opens (enables/disables npm target) | PublishModal |
| `/api/pack/{packageId}/publish` | POST | User confirms publish | PublishModal |

## 3. Editing (via InspectorPanel / edit surface)

Saves go through the shared entity endpoints in the API contract (agents, prompts, tools, models, hooks collections). The canvas itself never writes; after any save resolves, CompositionView calls `refreshComposition()` which re-fetches agent detail + affected prompts and bumps `refreshEpoch` so nodes re-measure.

## 4. Expected response shapes (consumed fields only)

### `GET /api/agents`

```json
{
  "agents": [
    {
      "id": "fraud_review_agent",
      "name": "fraud_review_agent",
      "title": "fraud_review_agent",
      "type": "dual_ai",
      "description": null,
      "icon": null,
      "default_prompt": "risk_analyst",
      "default_model": "",
      "tools": [],
      "side_a_label": "Risk Analyst",
      "side_a_agent_prompt": "risk_analyst",
      "side_b_label": "Customer Advocate",
      "side_b_agent_prompt": "customer_advocate",
      "env": null,
      "created_at": 1785279150,
      "packed": false
    }
  ]
}
```

`type` is `dual_ai` or `ai_human`; side fields are `null` for `ai_human` (single AI side + human receiver).

### `GET /api/models`

```json
{
  "models": [
    {
      "id": "default",
      "name": "default",
      "provider": "openrouter",
      "provider_id": "openrouter",
      "model": "deepseek/deepseek-v4-flash",
      "pricing_range": { "input": { "min": 0.09, "max": 0.225 }, "output": { "min": 0.18, "max": 1 } },
      "fallbacks": [],
      "providerTools": [],
      "capabilities": {
        "supportsImages": false,
        "supportsToolCalls": true,
        "supportsStreaming": true,
        "supportsJsonMode": true,
        "maxContextTokens": 1048576,
        "maxOutputTokens": 393216
      }
    }
  ]
}
```

### `GET /api/tools`

Returns function tools, prompt-tools, subagents, and handoffs with `name`, `description`, and schema fields. ToolNode uses `kind` to pick its card renderer.

### `GET /api/prompts/{name}`

Returns `{ name, body, model_name, model_provider, model_id, required_schema, variables, max_turns }`. `model_*` fields produce the `model` edge from the side/prompt node to a model node.

### Provider icon

`GET /api/providers/{provider}/icon?model={model}` returns an icon (SVG data URI or image). Cache per `provider:model` key for the session.

### Pack analyze (`/api/pack/{id}/analyze`)

Returns the dependency closure: agents, prompts, tools, models, hooks the pack would include, each flagged as shared or private. Drives DependencyTree and ExtractCopyToggle defaults.

### Unpack analyze (`/api/unpack/{packageId}/analyze`)

Returns the package contents with shared-item detection (items already in the workspace). Drives UnpackTree.

## 5. Error handling

| Case | Behavior |
|---|---|
| Any catalog GET fails | Canvas shows error state with retry button; layout is not computed |
| `GET /api/agents/{name}` 404 | Empty state: "Agent not found", clear `?agent=` param |
| Prompt/tool detail fails | Node renders card skeleton with a warning badge; layout still succeeds (fallback sizes) |
| Pack/unpack/publish POST fails | Modal keeps its state, shows server error message inline |
| 401 anywhere | Global: redirect to `/login` |

## 6. Caching rules

- Catalogs: cached in the composition store; invalidated on save events and on pack/unpack completion.
- Prompt/tool details: cached per name for the session; invalidated by `refreshEpoch` bump.
- Provider icons: immutable, cache forever per session.
