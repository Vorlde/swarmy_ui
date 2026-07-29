# PRD: Agents

Feature area: agent composition, pack/unpack, publish.

## User stories

- As a builder, I can see all my agents in a list so I can pick one to work on.
- As a builder, I can open an agent in the composition view and edit its
  structure visually (nodes and connections on a canvas).
- As a builder, I can configure each agent node's model, tools, and prompts
  from an inspector panel.
- As a builder, I can pan and zoom the canvas to navigate large agent graphs.
- As a builder, I can pack an agent into a publishable package with version,
  license, and readme metadata.
- As a builder, I can publish a packed agent to the marketplace.
- As a builder, I can unpack a marketplace package into a local agent.

## Functional requirements

1. Agents list view: name, summary info, link to open the composition view.
2. CompositionView: horizontal snap-scroll carousel of three cards - Agents,
   Threads (with embedded thread inspector), and Structure.
3. Structure card: resizable split with a tree on the left and a detail pane
   on the right.
4. Custom SVG canvas: CanvasGrid background, CanvasEdges rendering, pan/zoom
   controls, ELK-style automatic layout, AgentNode components, InspectorPanel
   for node configuration.
5. Pack flow: analyze the agent, show metadata and packed-info, let the user
   set item selections, version, package id/name, license, and readme, then
   pack.
6. Publish flow: publish a packed package; surface npm token status before
   publishing.
7. Unpack flow: analyze a package id, then unpack it into local agents.

## Non-functional requirements

- Canvas interactions (pan/zoom/drag) must stay at 60fps for graphs of up to
  a few hundred nodes.
- All canvas visuals (grid, edges, node chrome) must be token-driven so the
  canvas can be re-themed without logic changes.
- The carousel layout must be a layout primitive; switching to a static
  multi-column layout must not touch view logic.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/agents` | List agents |
| GET | `/api/agents/:name` | Agent detail |
| GET | `/api/agents/:name/tenvs` | Agent template env vars |
| POST | `/api/pack/:agentName` | Pack an agent |
| GET | `/api/pack/:agentName/analyze` | Analyze before packing |
| GET | `/api/pack/:agentName/metadata` | Pack metadata |
| GET | `/api/pack/:agentName/packed-info` | Packed package info |
| POST | `/api/pack/:agentName/publish` | Publish package |
| GET | `/api/pack/npm-token-status` | Check npm token before publish |
| POST | `/api/unpack/:packageId` | Unpack a package |
| GET | `/api/unpack/:packageId/analyze` | Analyze a package |
| GET | `/api/variables/agents/:name` | Variables used by an agent |

## Acceptance criteria

- Agents list renders from live data with loading and empty states.
- CompositionView loads as a 3-card snap carousel; each card is independently
  scrollable and the Threads card embeds the thread inspector.
- Canvas renders nodes and edges, supports pan/zoom, and selecting a node
  opens the inspector panel with its configuration.
- The structure tree resizer drags smoothly and persists within the session.
- Pack flow completes end to end and shows the packing result.
- Publish is blocked with a clear message when no npm token is configured.
- Unpacking a valid package produces a new local agent visible in the list.
