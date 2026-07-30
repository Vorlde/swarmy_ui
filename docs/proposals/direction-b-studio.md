# Direction B - Studio

Ambition: rebuild the shell and information architecture around the canvas.
The agent graph is the product; everything else is a dock around it. The
mental model shifts from "admin panel with 15 pages" to "creative tool"
(Figma, Blender, Unreal editor, node-based tools like n8n/ComfyUI).

## Thesis

The current IA treats the composition canvas as view 3 of 15, a sibling of
CRUD tables. But composition is the entire reason the product exists;
prompts, models, tools, and threads only matter in relation to an agent
being built or run. A studio-shaped app makes the primary loop
(compose -> run -> observe -> adjust) happen on one surface with zero
navigation, which is the single biggest smoothness win available: not
faster page transitions, but no page transitions.

## Layout

Full-bleed canvas. Three dock zones plus a top bar. Every dock is
collapsible, resizable, and remembers its state per agent.

```
+----------------------------------------------------------------------+
| [=] swarmy_ui   fraud_review_agent v  [Dual AI]     [> Run] [Pack v] |
+------------+----------------------------------------+----------------+
| LIBRARY    |                                        | INSPECTOR      |
| [search]   |                                        |                |
| v Agents   |          (side A)---(agent)---(model)  | model: gpt-4o  |
|   fraud_.. |               \       |                | provider  ...  |
|   inv_ch.. |                \   (tool)(tool)        | temp      0.2  |
| v Prompts  |                 \                      | caps  [json]   |
|   extrac.. |                  (side B)              | vars (3)       |
| v Tools    |                                        |                |
| v Models   |                                        | [Open editor]  |
| v Hooks    |     [zoom - 100% + | fit]              |                |
+------------+----------------------------------------+----------------+
| RUN CONSOLE   thread 3f9a1c  o RUNNING   $0.0021    [stop] [detach]  |
| side_a: Checking transaction history for account...                  |
| tool:lookup_account -> {"status":"flagged", "score": 0.87}           |
| side_b: Based on the flag score I recommend escalation to...         |
+----------------------------------------------------------------------+
```

- **Library dock (left, 260px).** The entire catalog as one searchable tree:
  agents, prompts, tools, models, hooks, marketplace packages. Items drag
  onto the canvas to attach (drag a model onto an agent node = model edge;
  drag a prompt onto a side = prompt binding). Replaces the Prom pts/
  Models/Tools list views for the 90% case.
- **Canvas (center).** The existing composition-canvas spec survives nearly
  intact (nodes, edges, panzoom, structure semantics). It gains drop
  targets and an in-canvas quick-add radial menu (right-click or `A`).
- **Inspector dock (right, 320px).** Same contextual inspector as the
  current spec. Deep editing (prompt body, schemas) opens Monaco in a
  bottom-sheet over the canvas, not a route change.
- **Run console (bottom, collapsible).** The killer feature. `Run` starts a
  thread on the current agent and streams it right there: messages, tool
  calls, logs, cost ticker. Clicking a tool-call frame highlights the
  producing node on the canvas. "Detach" promotes the console to the full
  thread inspector when deeper analysis is needed.

## Information architecture

- Home = last opened agent's studio (or agent picker on first run).
- A slim icon rail (far left, 48px) keeps secondary surfaces one click
  away: Threads (full inspector list), Marketplace, Settings (users, keys,
  providers, variables). These reuse the current view specs unchanged,
  rendered on a standard page shell.
- Cmd+K palette (as in direction A) is the universal navigator.

## The loop this unlocks

```
edit prompt in inspector -> Run -> watch side A/B converse in console
     -> spot bad tool output -> click frame -> node highlights
     -> fix tool schema in bottom sheet -> Run again
```

Today that loop crosses 4 views and 2 modals. In Studio it is one surface,
zero navigation events. That difference compounds hundreds of times a day.

## What is kept

- The entire composition-canvas spec folder (nodes, edges, panzoom,
  domain model, api binding) - it becomes the app core instead of a view.
- Thread inspector spec (as the "detached" deep-dive surface).
- All settings/admin view specs, marketplace spec, auth flow, tokens,
  typed client, WS manager.

## What is replaced

- The sidebar-shell IA: sidebar becomes the icon rail + library dock.
- Prompts/Models/Tools as primary destinations: they become library
  categories with the same panels for editing (list views remain reachable
  for bulk/admin work).
- The modal edit stack: bottom sheets and panels, as in direction A.

## New infrastructure required

- **Dock manager.** Resizable, collapsible, state-persisted dock zones
  (~1 layout component + a `layoutStore`; no library needed at this scope).
- **Drag-and-drop attach model.** Library item -> canvas node with typed
  drop rules from the existing domain model (which edges are legal is
  already specced in domain-model.md).
- **Run console.** New component, but it is a re-skin of the specced
  MessagesPane + log stream over the existing thread WS endpoints; plus a
  frame->node correlation map (tool call id -> canvas node id).
- Query cache + palette + panels from direction A (shared foundation).

## Architecture impact

- Router shrinks: `/studio/:agentId?` plus the rail routes. Canvas state
  moves from "view local" to "app core" (agentsStore absorbs layout
  persistence it already owns in the current spec).
- No new dependencies beyond direction A's; the dock manager is owned code
  under the swappability mandate (it is literally the layout-swap layer).

## Risks

- Medium. Dock-heavy UIs can overwhelm; mitigated by shipping with all
  docks closed except library, and a "zen" toggle (canvas only).
- The run console must not degrade canvas performance while streaming;
  frames render in a virtualized list and canvas highlights are
  class-toggle only.
- Small screens: Studio is desktop-first by nature; below `lg` it falls
  back to direction A's stacked layout (library and console become
  drawers). This fallback must be specced, not improvised.

## Choose this when

The composition experience is the product's identity and the target user
is the person building agents daily. This is the direction with the
highest ceiling: it turns the product from "usable" into "a tool people
show other people".
