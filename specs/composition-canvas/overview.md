# Composition Canvas - Overview

Project: **swarmy_ui**
Component: Composition Canvas (agent composition editor)
Stack: Vue 3 (`<script setup lang="ts">`), Vite, Tailwind CSS, custom SVG rendering. No third-party flow/graph library.

## What it is

The Composition Canvas is the visual heart of swarmy_ui. It renders a single agent as a graph of connected nodes on an infinite 2D canvas. Six node card kinds are rendered (this is the complete set, and it is the key set of the node-type registry in `domain-model.md`):

| `kind` | Card |
|---|---|
| `agent` | **AGENT** root card - `AI + HUMAN` type pill, icon, name, a VARIABLES column, and one summary column per side (`SUPPORT` / `HUMAN`) |
| `prompt` | **PROMPT** card - side pill, inline model chip, Tool/Context/Reasoning columns, Input schema, Variables, and a Functions / Sub-prompts / Handoffs / Sub-agents rail |
| `function` | **FUNCTION** card - name + description, `ARGS` section |
| `subagent` | **SUB-AGENT** card - `DUAL AI` pill, `max N session turns` chip, description, one column per inner side |
| `human` | **Human** card - single line, `Receives user messages and input.` |
| `model` | **MODEL** card - provider pill, model id, pricing, capability cells, context/output limits |

**Subagents** additionally produce a **group**: a solid-bordered container (`[data-canvas-group]`, `border-neutral-200/60` on `bg-[#f7f7f7]`, radius 8px, its own 20px dot sub-grid) with an overlapping label chip and badges (`Blocking`, `Single`).

Nodes are connected by routed SVG edges drawn as orthogonal polylines with rounded elbows: structural edges (solid) and model edges (dashed). In the shipped theme both render in neutral grey (~`#d4d4d4`); side identity is carried by the **node card border colour**, not by edge colour.

## Mental model

The canvas answers one question at a glance: **"What is this agent made of, and how do the pieces connect?"**

- Vertical reading order = containment: agent at top, sides below, tools below sides, models outboard or below.
- Left/right position = side identity: side A columns to the left, side B columns to the right.
- Card border colour = side identity: sky `#00a6f4` for side A (`SUPPORT` / `WORKER`), amber `#fe9a00` for side B (`HUMAN` / `REVIEWER`); `neutral-900 #171717` for the agent root and sub-agent cards; `neutral-300 #d4d4d4` for neutral cards (function, model).
- Group containers = subagent boundaries (a reusable agent embedded inside this one).
- Dashed edges = "this prompt runs on this model".
- Everything on the canvas is a **read view** of server state, and also an **edit launcher**: click a region, get an editor.

The canvas is not a free-form drag-and-drop builder. Node positions are computed by an auto-layout algorithm from the agent's composition data. Users do not drag nodes to reposition them; they interact to select, inspect, focus, zoom, and edit.

## How a user interacts with it

1. Opens `/agents`, sees the Agents list (cascade snap section 1). Selecting an agent appends the Threads/Messages/Inspector section, and the sidebar gains a `Structure` item; clicking it scrolls the cascade to the Structure section, which is where this canvas lives.
2. The canvas auto-fits: the whole composition is visible, centered. Fit-to-content is the default view and reads **11%** for the reference agent.
3. **Pan**: drag empty canvas (left or middle mouse), or scroll wheel/trackpad. The canvas cursor is `grab` (`grabbing` while dragging).
4. **Zoom**: Ctrl/Cmd + wheel (zooms toward cursor), or the floating zoom controls at `bottom-4 left-4` (`-` / readout / `+` / fit-to-screen). `+`/`-` step in ~4-percentage-point increments. Zoom range 0.1x - 2.5x.
5. **Hover** a node: connected edges and neighboring nodes stay lit, everything else dims to 25% opacity.
6. **Click** a node: selects it (highlight ring, connected edges thicken) and the Inspector panel opens for that entity. Clicking empty canvas deselects and restores the previous viewport.
7. **Double-click** a node: animated zoom to 1.2x scale focused on that node.
8. **Click a group** (subagent container): focuses that group.
9. **Click an edit region** on a card (prompt body, tool config, variables): opens the edit surface overlay for that entity/section.
10. **Pack / Unpack / Publish**: reached from the kebab (`...`) menu on an Agents-list row (`Edit / Pack / Delete`), not from a canvas toolbar - the Structure pane has no toolbar, only the shared header.
11. After any save, the composition refreshes: layout recomputes, nodes re-measure, the canvas refits (unless the user has manually panned/zoomed, which locks auto-fit).

## Screen composition

The canvas is not a free-standing three-column screen. It lives inside the `/agents` cascade
(`.composition-scroll-container`, `overflow-x:auto` + `scroll-snap-type: x mandatory` +
`scroll-behavior: smooth`, flex track `gap: 12px`, sections `rounded-xl border border-black/10 bg-white
dark:border-white/10 dark:bg-neutral-900`) as **snap section 3, the Structure pane**. Column entry is a
scroll animation, not a transform.

The Structure section is a single pane with one shared header reading `Structure  <agent name>`, split
into two regions:

- **`.structure-tree`** (left): outline tree of the composition. Width persisted in
  `localStorage['composition.structureTreeWidth'] = "320"`, body `text-[12px]`, `border-r border-neutral-200`.
- **`.structure-tree-resizer`** between them: `w-[5px] cursor-col-resize -mx-[2px]`, hairline `w-px group-hover:bg-accent-500/60`.
- **Canvas viewport** (right): `relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50`,
  with **CompositionCanvas** inside and **CanvasControls** floating at `bottom-4 left-4`.

The **InspectorPanel** is not adjacent to the canvas: it is the third column of snap section 2
(Threads + Messages + Inspector). Pack / Unpack / Publish modals are launched from the Agents list.

## Looks vs logic (the swappability rule)

This spec deliberately separates two layers:

| Stable (do not change when restyling) | Swappable (theme-driven) |
|---|---|
| `CompositionLayout` data model | Node card appearance (colors, shapes, icons, density) |
| Node-type registry (`Record<CanvasNode['kind'], Component>`) | Which component is registered for a kind |
| `usePanZoom` composable | `CanvasGrid` pattern and colors |
| Edge router algorithm (`buildEdgePaths`) | Edge stroke colors/widths/dash patterns per kind |
| Node measurement (`useNodeMeasurement`) | Group container styling |
| Selection / hover / focus state machine | Selection ring, dimming, highlight treatment |

Concrete mechanism: all visual values come from a **canvas theme object** (`CanvasTheme`, see `domain-model.md`) injected via Vue `provide`/`inject`. Node card components consume the theme; the layout, router, and pan/zoom never touch it. A future restyle replaces the theme and the card components; the canvas engine is untouched.

## Rendering approach

- One transformed DOM layer, `absolute origin-top-left will-change-transform`, styled
  `transform: translate3d(tx, ty, 0); zoom: <scale>; transform-origin: 0 0; transition: opacity 200ms ease-out`.
  **Pan is `translate3d`; zoom is the CSS `zoom` property - never `transform: scale()`.** That is what keeps
  node text crisp at 11% and at 250%. It also changes the pointer math: see `panzoom.md` Section 2.
- The layer contains groups, the SVG edge layer, and absolutely positioned node cards.
- Edges are a single `<svg>` under the nodes, with one `<path>` per edge carrying `data-edge-id`, `data-edge-kind` and (when applicable) `data-edge-tool-kind`. Paths are computed by the custom router in `edge-routing.md`.
- The background dot grid sits **outside** the transform layer, in viewport space: an inline
  `<svg><pattern id="canvas-dot-grid" width="24" height="24"><circle cx="12" cy="12" r="1" class="fill-neutral-400/20 dark:fill-neutral-500/20">`. Its 24px spacing is constant on screen at every zoom level. Group sub-grids, which *are* inside the layer, use `width=20 height=20`, `r=0.75`, `fill-neutral-400/15`.
- Nodes are dispatched through a **node-type registry** keyed by `CanvasNode.kind` (a plain
  `Record<kind, Component>` module) - never a `v-if` chain in the template.
- Node sizes are **measured at runtime** (ResizeObserver) and fed back into the edge router as `nodeMetrics`, so cards can size to content while edges anchor precisely (model anchor Y, per-kind tool columns).
- Depth on canvas cards is **not** `box-shadow`: canvas node cards are flat, border-only. Where the app does show elevation (popovers, modals), it is a sibling `<canvas>` painting a diagonal-hatch shadow offset 6px right / 6px bottom that follows the corner radius.
