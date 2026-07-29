# Composition Canvas - Overview

Project: **swarmy_ui**
Component: Composition Canvas (agent composition editor)
Stack: Vue 3 (`<script setup lang="ts">`), Vite, Tailwind CSS, custom SVG rendering. No third-party flow/graph library.

## What it is

The Composition Canvas is the visual heart of swarmy_ui. It renders a single agent as a graph of connected nodes on an infinite 2D canvas:

- The **agent** itself (root card, top center).
- The agent's **sides** (side A and side B, e.g. "Risk Analyst" and "Customer Advocate" for a dual-AI agent, or an AI side plus a human side for an AI+human agent).
- Each side's **prompt** and **tools** (function tools, prompt-tools, subagents, handoffs, MCP tools, provider tools).
- **Hooks** attached to the agent lifecycle.
- **Models** powering each side/prompt, drawn as cards with provider icon, capabilities, and pricing.
- **Subagents**, drawn as groups (dashed containers) containing their own mini-graphs.

Nodes are connected by routed SVG edges: structural edges (agent -> side -> tools, solid) and model edges (prompt -> model, dashed).

## Mental model

The canvas answers one question at a glance: **"What is this agent made of, and how do the pieces connect?"**

- Vertical reading order = containment: agent at top, sides below, tools below sides, models outboard or below.
- Left/right position = side identity: side A columns to the left, side B columns to the right.
- Dashed containers = subagent boundaries (a reusable agent embedded inside this one).
- Dashed purple edges = "this prompt runs on this model".
- Everything on the canvas is a **read view** of server state, and also an **edit launcher**: click a region, get an editor.

The canvas is not a free-form drag-and-drop builder. Node positions are computed by an auto-layout algorithm from the agent's composition data. Users do not drag nodes to reposition them; they interact to select, inspect, focus, zoom, and edit.

## How a user interacts with it

1. Opens `/agents`, sees the Agents table. Selecting an agent loads the Composition view.
2. The canvas auto-fits: the whole composition is visible, centered.
3. **Pan**: drag empty canvas (left or middle mouse), or scroll wheel/trackpad.
4. **Zoom**: Ctrl/Cmd + wheel (zooms toward cursor), or the floating zoom controls (in / out / fit-to-view). Zoom range 0.1x - 2.5x.
5. **Hover** a node: connected edges and neighboring nodes stay lit, everything else dims to 25% opacity.
6. **Click** a node: selects it (highlight ring, connected edges thicken) and the Inspector panel opens for that entity. Clicking empty canvas deselects and restores the previous viewport.
7. **Double-click** a node: animated zoom to 1.2x scale focused on that node.
8. **Click a group** (subagent container): focuses that group.
9. **Click an edit region** on a card (prompt body, tool config, variables): opens the edit surface overlay for that entity/section.
10. **Pack / Unpack / Publish**: toolbar actions open modals to package the agent as an npm package, unpack one, or publish to a registry.
11. After any save, the composition refreshes: layout recomputes, nodes re-measure, the canvas refits (unless the user has manually panned/zoomed, which locks auto-fit).

## Screen composition

The canvas lives inside the Composition view alongside:

- **AgentBrowserPanel** (left): searchable/sortable list of agents.
- **CompositionCanvas** (center): the pan/zoom SVG/DOM canvas.
- **InspectorPanel** (right, contextual): editor for the selected node.
- **StructureTree** (collapsible tree view of the composition as an alternative to the graph).
- Modals: PackModal, UnpackModal, PublishModal.

## Looks vs logic (the swappability rule)

This spec deliberately separates two layers:

| Stable (do not change when restyling) | Swappable (theme-driven) |
|---|---|
| `CompositionLayout` data model | Node card appearance (colors, shapes, icons, density) |
| `usePanZoom` composable | `CanvasGrid` pattern and colors |
| Edge router algorithm (`buildEdgePaths`) | Edge stroke colors/widths/dash patterns per kind |
| Node measurement (`useNodeMeasurement`) | Group container styling |
| Selection / hover / focus state machine | Selection ring, dimming, highlight treatment |

Concrete mechanism: all visual values come from a **canvas theme object** (`CanvasTheme`, see `domain-model.md`) injected via Vue `provide`/`inject`. Node card components consume the theme; the layout, router, and pan/zoom never touch it. A future restyle replaces the theme and the card components; the canvas engine is untouched.

## Rendering approach

- One transformed DOM layer (`transform: translate3d + scale`, or `zoom` + translate when idle for crisp text) containing groups, the SVG edge layer, and absolutely positioned node cards.
- Edges are a single `<svg>` under the nodes but above the grid, with one `<path>` per edge. Paths are computed by the custom router in `edge-routing.md`.
- The grid is a lightweight SVG dot pattern sized to the current scale.
- Node sizes are **measured at runtime** (ResizeObserver) and fed back into the edge router as `nodeMetrics`, so cards can size to content while edges anchor precisely (model anchor Y, per-kind tool columns).
