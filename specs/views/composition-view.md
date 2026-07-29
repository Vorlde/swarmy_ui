# View Spec: CompositionView

- **Route:** `/agents/:id` (name: `composition`)
- **Auth:** Required
- **View component:** `src/views/CompositionView.vue`
- **Stores:** `agentsStore`, `compositionStore` (selected agent, canvas document), `threadsStore` (thread pane), `uiStore` (pane geometry, active card)
- **Canvas spec:** `specs/composition-canvas/` (domain model, pan/zoom, edge routing, API binding) - this spec covers only the shell around the canvas.

## Purpose

The workspace for one agent composition. The view is a shell that loads the agent, renders a toolbar, and hosts the composition canvas plus its supporting panels: the structure tree on the left and the node inspector on the right. It owns the deep-link query contract (`?thread=`) and the route param (`:id`) wiring, nothing more. All canvas behavior is specified in `specs/composition-canvas/`.

## Layout

Guarded layout. Inside the main area the view is a single full-height card with three regions: a left structure rail (resizable, collapsible), the canvas viewport in the center, and a right inspector pane (resizable) that appears when a node is selected. A slim toolbar sits on top.

### ASCII wireframe

```
+--------+---------------------------------------------------------------------+
|        | Toolbar: <- Agents  fraud_review_agent  [Dual AI]  [Run] [Pack v]   |
| Sidebar+----------+-------------------------------------------------+--------+
|  nav   |STRUCTURE |                CANVAS                           |INSPECT.|
|        | [search] |                                                 |        |
|        | Agent    |         (side A)----(agent)----(model)          | Node:  |
|        |  - Sides |              \        |                         | model  |
|        |  - Model |               \    (tool) (tool)                | prov.. |
|        |  - Tools |                \                                | caps.. |
|        |  - Hooks |                 (side B)                        | vars.. |
|        | Threads  |                                                 |        |
|        |  3f9a1c  |                        [zoom: - 100% + |fit|]   |        |
|        |<resizer> |                                                 |<resiz> |
|        +----------+-------------------------------------------------+--------+
```

Regions:

- **Toolbar (h-12):** back link to `/agents`, agent title + type badge, dirty indicator for unsaved composition edits, actions: `Run` (opens `CreateThreadModal` prefilled with this agent), overflow menu (`Pack` -> `POST /api/pack/:agentName` flow, `Rename`, `Delete` via `ConfirmDialog`).
- **Structure rail (default 280px, 48px collapsed):** `StructureTree` of the agent's composition (sides, model, tools, hooks) plus its threads. Selecting a tree row focuses the matching canvas node or opens the thread pane. Width and collapsed state persist in `uiStore`.
- **Canvas viewport (flex-1):** `CompositionCanvas` with `CanvasGrid`, `CanvasEdges`, node components, and `CanvasControls` overlay. See `specs/composition-canvas/overview.md` and `panzoom.md`.
- **Inspector pane (default 320px, hidden until selection):** `InspectorPanel` + `PropertyEditor`/`PropertyList` for the selected node. Closing the selection collapses the pane.

## Components used

Shell (this view wires these together):

- `StructureTree`, `StructureTreeRow` - left rail
- `CompositionCanvas`, `CanvasGrid`, `CanvasEdges`, `CanvasControls` - center viewport
- `AgentNode`, `SidePromptNode`, `ModelNode`, `ToolNode`, `HookNode` - canvas nodes (rendered by the canvas, not the view)
- `InspectorResizablePane`, `InspectorPanel`, `PropertyEditor`, `PropertyList` - right pane
- `AgentBrowserPanel` - picker when adding nodes
- `EditRegion` - inline editing on canvas cards
- `CreateThreadModal`, `PackModal`, `ConfirmDialog` - via `EditSurfaceHost`
- `UiButton`, `UiIconButton`, `UiBadge`, `UiTooltip`, `UiAlertBox`, `Loader`

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/agents/:id` | On mount | Full agent document (identity, sides, model, tools, hooks, variables). Drives the canvas document in `compositionStore`. |
| `GET /api/prompts/:name` | On mount, per referenced prompt | Side prompts (`side_a_agent_prompt`, `side_b_agent_prompt`) and the default prompt, so nodes can render prompt summaries. Cached in a prompts store. |
| `GET /api/models` | On mount (usually warm) | Resolves `default_model` to provider/capabilities for the `ModelNode`. |
| `GET /api/tools` and `GET /api/tools/:name` | On mount / on demand | Tool list for the browser panel; per-tool schemas for `ToolNode` detail. |
| `GET /api/providers` | On mount (usually warm) | Provider icons/metadata on model and tool nodes. |
| `GET /api/threads?agent_id=<id>&limit=20` | On mount | Threads section of the structure rail. |
| `WS /api/events` | Global socket from shell | `thread_created`/`thread_updated` frames refresh the rail's thread section. |

Saving composition edits writes through the composition document endpoints described in `specs/composition-canvas/api-binding.md`; this view only triggers the store actions.

## User interactions

1. **Select a canvas node** -> inspector pane opens with the node's properties; selection synced to `?node=` (optional) via `router.replace`.
2. **Select a thread in the rail** -> `?thread=<uuid>` synced to the URL; the thread pane opens with the shared inspector components (see `thread-inspector-view.md` - same components, embedded host).
3. **Resize the rails** -> drag the 5px resizer handles; widths persist in `uiStore` per session and localStorage across sessions.
4. **Run the agent** -> `CreateThreadModal` prefilled with `agent_id`; on submit `POST /api/threads`, then the new thread is selected in the rail (`?thread=`).
5. **Edit inline** -> `EditRegion` on a node card opens the matching edit surface through the uiStore modal stack (never inline).
6. **Pack / rename / delete** from the toolbar overflow menu.
7. **Unknown agent id** -> if `GET /api/agents/:id` 404s, show the not-found state with a back link to `/agents`.

## States

| State | Trigger | Rendering |
|---|---|---|
| **Loading** | Agent document in flight | Canvas area skeleton with centered `Loader`; toolbar shows title placeholder |
| **Ready** | Document loaded, layout computed | Canvas + rails rendered |
| **Empty composition** | Valid agent with no nodes | Canvas shows a placeholder hint + `AgentBrowserPanel` CTA |
| **Node selected** | Selection active | Inspector pane visible at its persisted width |
| **Thread selected** | `?thread=` present | Thread pane open over/right of the canvas region |
| **Saving** | Composition write in flight | Toolbar dirty indicator becomes a spinner, then clears |
| **Error (load)** | Agent fetch fails / 404 | Full-view `UiAlertBox`: "Agent not found" + back link |
| **Error (save)** | Write fails | `UiAlertBox` toast with retry; document keeps local edits |
| **Auth expired** | Any 401 | Global unauthorized handler -> `/login?redirect=/agents/:id` |

## Theming

- **Shell chrome:** the card uses `bg-background-soft` / `border-border` / `--radius-*`; the toolbar and rail headers read semantic text tokens. A chrome restyle is a shell-level change, not a view change.
- **Canvas surface:** the grid dot color, viewport background, and minimap/controls colors are theme tokens consumed by `CanvasGrid` and `CanvasControls`; node and edge colors come from the `--agents-accent-*` family and per-kind aliases defined in `specs/composition-canvas/`. Re-theming the accent family restyles nodes, edges, selection rings, and rails together.
- **Pane geometry:** rail widths (280/48/320px defaults) and the resizer styling live in `uiStore` values and named classes (`structure-tree`, `structure-tree-resizer`, `threads-col`, `inspector-pane`); changing arrangement is one place, per the layout rules in `docs/design/theming.md`.
- **Inspector:** form chrome is `UiFormField` + token-based spacing; a compact theme tightens it globally.
- **Full reskin:** the shell is just composition of the canvas spec components. An alternative arrangement (inspector as a bottom sheet, rail as an overlay) rewrites this view's template and the pane geometry values while reusing every canvas, tree, and inspector component unchanged.

## Notes

- This view contains route wiring only: it maps `:id`, `?thread=`, and selection state into stores, and renders the shell. All canvas math, node contracts, and edge behavior belong to `specs/composition-canvas/`.
- The thread pane reuses the exact components of the standalone thread inspector (`/threads/:id`); behavior fixes there apply here automatically.
- Deep links must survive the auth round trip: `/agents/:id?thread=<uuid>` is preserved in the login `?redirect=` param by the router guard.
