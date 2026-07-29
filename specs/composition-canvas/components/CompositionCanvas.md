# CompositionCanvas

Project: **swarmy_ui**. The interactive canvas surface: pan/zoom viewport, groups, edges, and nodes.

## Purpose

Renders a `CompositionLayout` inside a pannable/zoomable viewport. Dispatches each node to its type component, draws CanvasGrid and CanvasEdges underneath, and CanvasControls overlaid. Owns pan/zoom (via `usePanZoom`) and node measurement (via `useNodeMeasurement`).

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

- Viewport container is `cursor-grab`, `cursor-grabbing` while panning.
- Content layer: absolutely positioned div with `transform: translate3d(x, y, 0) scale(s)`, `transform-origin: 0 0`, `will-change: transform`.
- Groups render as dashed containers behind edges; nodes on top.
- Hover-neighborhood dimming: when `hoveredNodeId` is set, nodes and edges not in its adjacency set fade to `theme.node.hoverDimOpacity` over 120ms.
- Initial mount and layout change trigger `fitToView()` unless the user has manually zoomed (auto-fit lock).

## States

- **Loading**: full-canvas skeleton (grid visible, shimmering placeholder cards at approximate positions).
- **Empty**: `hasAgent === false` shows centered "Select an agent" message over the grid.
- **Error**: `error` string shown centered with a Retry affordance (re-emitted to parent).

## Theming

Reads `CanvasTheme` via `inject('canvasTheme')`. Grid colors come from `theme.grid`, group chrome from `theme.group`, dim opacity from `theme.node.hoverDimOpacity`, viewport background from `--color-bg-canvas`. The pan/zoom math and measurement never read the theme, so a reskin (dot grid vs line grid, rounded vs square groups, dark canvas) is a pure token swap.
