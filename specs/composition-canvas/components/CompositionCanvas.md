# CompositionCanvas

Project: **swarmy_ui**. The interactive canvas surface: pan/zoom viewport, groups, edges, and nodes.

## Purpose

Renders a `CompositionLayout` inside a pannable/zoomable viewport. Dispatches each node through the
**node-type registry** (`<component :is="nodeRegistry[node.kind]">`, see `domain-model.md` Section 3) -
never a `v-if`/`v-else-if` chain over node kinds. Draws CanvasGrid and CanvasEdges underneath and
CanvasControls overlaid. Owns pan/zoom (via `usePanZoom`) and node measurement (via `useNodeMeasurement`).

## Props

```ts
interface Props {
  layout: CompositionLayout;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  refreshingNodeId?: string | null;  // node being re-fetched; shows inline spinner
  refreshEpoch?: number;             // bump forces re-measure
  loading?: boolean;
  error?: string | null;
  hasAgent?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select-node` | `CanvasNode` | node click |
| `deselect` | - | click on empty canvas / Escape |
| `hover-node` | `string \| null` | node mouseenter/mouseleave |
| `nodes-measured` | `NodeMetrics` | measurement pass completes |
| `open-edit-surface` | `{ node: CanvasNode; editData: EditTarget }` | node edit affordance clicked |
| `view-agent` | `name: string` | subagent group title clicked (navigates to that agent) |

## Slots

None.

## API calls

None directly (nodes may lazy-load their own details).

## Visual behavior

- Viewport shell: `relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50`; pointer surface inside it is `absolute inset-0 cursor-grab` (`cursor-grabbing` while panning).
- Content layer: `absolute origin-top-left will-change-transform` with `transform: translate3d(x, y, 0); zoom: <scale>; transform-origin: 0 0; transition: opacity 200ms ease-out`. **Pan is `translate3d`, zoom is the CSS `zoom` property - never `transform: scale()`.** That is what keeps node text crisp at 11%.
- Each node element carries `data-canvas-node` and `data-canvas-node-id="<id>"`; model nodes also carry `data-canvas-model-node`.
- Groups render as **solid-bordered** containers (`[data-canvas-group]`, `border-neutral-200/60 bg-[#f7f7f7] dark:border-neutral-700/50 dark:bg-[#1e1e1e]`, radius 8px) behind edges, each with its own 20px dot sub-grid, a label chip and badges; nodes on top. Not dashed.
- Node cards have no shadow. Selected surface is `#efe3ff` light / `#302043` dark; hover `#f8f2ff` / `#1c1525`.
- Hover-neighborhood dimming: when `hoveredNodeId` is set, nodes and edges not in its adjacency set fade to `theme.node.hoverDimOpacity` over 120ms.
- Initial mount and layout change trigger `fitToView()` unless the user has manually zoomed (auto-fit lock). The default fit is 11% for the reference agent.

## States

- **Loading**: full-canvas skeleton (grid visible, shimmering placeholder cards at approximate positions).
- **Empty**: `hasAgent === false` shows centered "Select an agent" message over the grid.
- **Error**: `error` string shown centered with a Retry affordance (re-emitted to parent).

## Theming

Reads `CanvasTheme` via `inject('canvasTheme')`. Grid colors come from `theme.grid`, group chrome from `theme.group`, dim opacity from `theme.node.hoverDimOpacity`, viewport background from `--color-bg-canvas`. The pan/zoom math, the node registry, and measurement never read the theme, so a reskin (dot grid vs line grid, rounded vs square groups, dark canvas) is a pure token swap - and adding a card type is a `nodeRegistry` entry, not a template edit.
