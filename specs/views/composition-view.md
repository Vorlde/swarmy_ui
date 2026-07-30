# View Spec: CompositionView (the cascade)

- **Route:** `/agents` (name: `agents`). Selection is in the **query string**: `?agent=<agent_name>&thread=<uuid>`. There is no `/agents/:id` route.
- **Auth:** Required
- **View component:** `src/views/CompositionView.vue`
- **Stores:** `agentsStore`, `compositionStore` (selected agent, canvas document), `threadsStore`, `uiStore` (pane geometry, snap position)
- **Canvas spec:** `specs/composition-canvas/` - this spec covers only the cascade shell.

## Capture reconciliation

The earlier draft described `/agents/:id` and a single card split into "structure rail | canvas | inspector pane" with a `h-12` toolbar. **None of that matches the live app.** Corrected against `agents-cascade-3col-light.png`, `agents-cascade-snap2-threads-messages-inspector-light.png`, `agents-cascade-snap3-structure-light.png`, `agents-cascade-fullwidth-3500-light.png` and `exact-tokens.md` 3.2:

- The view is a **horizontal snap-scroll cascade**, not a split card. There is no toolbar row; each section carries its own header bar.
- Sections are appended as selection deepens, and the container **smooth-scrolls** to the new section. The "column slide-in" is a scroll animation, not a transform.
- The structure tree and canvas are their own snap section, not a rail beside the canvas.
- `/threads` renders the same shell minus the Agents section (see `threads-view.md`).

## Purpose

One shell that grows with selection. Pick an agent and the cascade appends its threads, messages and inspector; the sidebar simultaneously grows `Threads` and `Structure` shortcuts that scroll to the matching snap section.

## Layout

`main.flex-1.overflow-auto.my-3.flex.flex-col.rounded-l-xl.border-l.border-neutral-200` hosts `.composition-scroll-container`:

```
overflow-x: auto;
scroll-snap-type: x mandatory;
scroll-behavior: smooth;
```

Inside it a flex track: `display:flex; gap:12px; height:100%`. Each snap section is
`rounded-xl overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900`
-> `1px solid #d4d4d4`, radius 12px, background `#ffffff`.

Measured at a 1512 viewport with an agent and a thread selected (`scrollWidth 3171`, `clientWidth 1271`):

| # | Section | `[offsetLeft, width]` | Contents |
|---|---|---|---|
| 1 | Agents | `[-1, 782]` | `AgentsPane` (see `agents-view.md`) |
| 2 | Thread workspace | `[793, 1143]` | `ThreadsPane` (`.threads-col`, 280px) + `MessagesPane` (flex-1) + `ThreadInspectorPane` |
| 3 | Structure | `[1948, 1223]` | `StructureTree` (320px) + resizer + canvas viewport |

Sections 2 and 3 exist only when `?agent=` is set; section 3's canvas needs no thread.

```
+---------+ +----------------------------------------+ +------------------------+
| Agents  | | Threads | Messages       | Inspector    | | Structure  <agent>     |
| (3)     | | (2)  o  |            $x  | Logs|Files.. | +-----------+------------+
|---------| |---------|----------------|--------------| | tree 320px| canvas     |
| grid    | | thread  |  bubbles       | log table    | |  |- Vars   |   . . . .  |
| rows    | | thread  |                |--------------| |  |- Support|   . . . .  |
|         | |  |- sub |                | log detail   | |  |- Tools  |            |
|         | |  |- sub |  [composer]    | stat tiles   | |           | [-][11%][+][fit]
+---------+ +----------------------------------------+ +------------------------+
   782            280      flex-1          flex-1              320      flex-1
                            <---- section 2 ---->
```

### Motion (from the capture, all gated on `body.enable-motion`)

- `.threads-col` animates `width .2s, min-width .2s cubic-bezier(.4,0,.2,1)` between **280px** and its collapsed **48px**.
- Sidebar `aside` animates `all .3s cubic-bezier(.4,0,.2,1)` between 240px and 64px.
- Sidebar cascade items mount with `sidebar-cascade-in` (`opacity 0 -> 1`, `translateY(-4px) -> 0`), `.2s ease-out both`, staggered.
- Selecting an agent/thread appends a section and smooth-scrolls to it. Do **not** implement this as a transform or a slide transition.

## Components used

Shell (this view wires these together):

- `AgentsPane` - snap section 1
- `ThreadsPane`, `MessagesPane`, `ThreadInspectorPane` - snap section 2
- `StructureTree`, `StructureTreeRow` - snap section 3, left pane (320px, width persisted in `localStorage["composition.structureTreeWidth"]`)
- `CompositionCanvas`, `CanvasGrid`, `CanvasEdges`, `CanvasControls` - center viewport
- `AgentNode`, `SidePromptNode`, `ModelNode`, `ToolNode`, `HookNode` - canvas nodes (rendered by the canvas, not the view)
- `InspectorPanel`, `PropertyEditor`, `PropertyList` - canvas node inspection
- `AgentBrowserPanel` - picker when adding nodes
- `EditRegion` - inline editing on canvas cards
- `CreateThreadModal`, `PackModal`, `ConfirmDialog` - via `EditSurfaceHost`
- `UiButton`, `UiIconButton`, `UiBadge`, `UiTooltip`, `UiAlertBox`, `Loader`

## Data loading

| Endpoint | When | Notes |
|---|---|---|
| `GET /api/agents/:name` | When `?agent=` changes | Full agent document (identity, sides, model, tools, hooks, variables). Drives the canvas document in `compositionStore`. |
| `GET /api/prompts/:name` | On mount, per referenced prompt | Side prompts (`side_a_agent_prompt`, `side_b_agent_prompt`) and the default prompt, so nodes can render prompt summaries. Cached in a prompts store. |
| `GET /api/models` | On mount (usually warm) | Resolves `default_model` to provider/capabilities for the `ModelNode`. |
| `GET /api/tools` and `GET /api/tools/:name` | On mount / on demand | Tool list for the browser panel; per-tool schemas for `ToolNode` detail. |
| `GET /api/providers` | On mount (usually warm) | Provider icons/metadata on model and tool nodes. |
| `GET /api/threads?agent_id=<id>&limit=20` | On mount | Threads section of the structure rail. |
| `WS /api/events` | Global socket from shell | `thread_created`/`thread_updated` frames refresh the rail's thread section. |

Saving composition edits writes through the composition document endpoints described in `specs/composition-canvas/api-binding.md`; this view only triggers the store actions.

## User interactions

1. **Select an agent** -> `?agent=<name>` via `router.replace`; sections 2 and 3 mount and the container smooth-scrolls to section 2.
2. **Select a thread** -> `?thread=<uuid>` via `router.replace`; the Messages and Inspector panes bind to it.
3. **Sidebar `Threads` / `Structure`** -> scroll the container to snap section 2 / 3. Re-clicking the active route scrolls back to the start rather than re-navigating.
4. **Select a canvas node** -> node inspection opens; selection synced to `?node=` (optional) via `router.replace`.
5. **Resize the structure tree** -> drag `.structure-tree-resizer` (`w-[5px] cursor-col-resize -mx-[2px]`, hairline `w-px group-hover:bg-accent-500/60`); the width persists in `localStorage["composition.structureTreeWidth"]`.
6. **New thread** -> the `+` button in the Threads header; on submit `POST /api/threads`, then the new thread is selected (`?thread=`).
7. **Edit inline** -> `EditRegion` on a node card opens the matching edit surface through the uiStore modal stack (never inline).
8. **Pack / delete** from the agent row kebab in section 1, not from a toolbar.
9. **Unknown agent name** -> if the agent fetch 404s, section 1 stays and sections 2-3 render a not-found state.

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
- **Pane geometry:** measured defaults are `.threads-col` 280px (collapsed 48px) and `.structure-tree` 320px. They live in `uiStore` values and named classes (`structure-tree`, `structure-tree-resizer`, `threads-col`, `inspector-pane`), never inline in the template.
- **Section registration:** the cascade renders a registered, ordered list of sections rather than a hardcoded three. A future section (for example a Metrics pane) is a plug that registers `{ id, order, component, visibleWhen }`; `CompositionView.vue` is not edited. See ADR-008.
- **Elevation:** none anywhere in the cascade. Sections are bordered, not shadowed.
- **Inspector:** form chrome is `UiFormField` + token-based spacing; a compact theme tightens it globally.
- **Full reskin:** the shell is just composition of the canvas spec components. An alternative arrangement (inspector as a bottom sheet, rail as an overlay) rewrites this view's template and the pane geometry values while reusing every canvas, tree, and inspector component unchanged.

## Notes

- This view contains route wiring only: it maps `:id`, `?thread=`, and selection state into stores, and renders the shell. All canvas math, node contracts, and edge behavior belong to `specs/composition-canvas/`.
- The thread pane reuses the exact components of the standalone thread inspector (`/threads/:id`); behavior fixes there apply here automatically.
- Deep links must survive the auth round trip: `/agents?agent=<name>&thread=<uuid>` is preserved in the login `?redirect=` param by the router guard. This is the exact deep link used throughout the capture.
- The live status dot beside the `Threads` and `Messages` titles (`w-2 h-2 rounded-full bg-green-500 dark:bg-green-400`, `#00c950` / `#05df72`) reflects WebSocket connection state.
