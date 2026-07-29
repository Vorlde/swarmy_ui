# Composition Canvas - Edge Routing

Project: **swarmy_ui**. Custom orthogonal-style router producing SVG path `d` strings. No third-party routing library. The router is pure functions over layout + measured metrics: fully unit-testable, theme-independent.

## 1. Entry point

```ts
export interface RoutedEdge {
  id: string;
  d: string;                 // SVG path data
  kind: EdgeKind;
  sideId?: SideId;
  toolKind?: ToolKind;
}

export interface EdgeRouterInput {
  nodes: CanvasNode[];       // with final positions
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  metrics: NodeMetrics;      // measured sizes + anchors (may be partial during first paint)
}

export function buildEdgePaths(input: EdgeRouterInput): RoutedEdge[];
```

Dispatch:

- `kind === 'structural'` -> `routeStructuralEdge(...)` (Section 3)
- `kind === 'model'` -> `routeModelEdge(...)` (Section 4)

Output order matches input edge order (stable for SVG rendering and hit-testing).

## 2. Constants

| Constant | Value | Meaning |
|---|---|---|
| `SEG` | 8 | minimum segment length (px) |
| `LANE_GAP` | 20 | spacing between parallel edges sharing a corridor |
| `EXIT_LEN` | 20 | length of the straight exit stub from source / entry stub into target |
| `OBSTACLE_PAD` | 12 | inflation of obstacle rects for avoidance |
| `CORNER_R` | 6 | corner radius for path rounding |
| `MAX_DETOUR` | 400 | cap on avoidance detour before falling back to a straight dogleg |

## 3. Structural edges (`routeStructuralEdge`)

Structural edges flow top-down: **source bottom** to **target top**.

### Anchors

- Source anchor: `(source.x + source.width / 2, source.y + sourceHeight)`, where `sourceHeight` is measured (`metrics[source.id].h`) or the estimated `source.height`.
- Target anchor:
  - If the edge has `toolKind` and the target node exposes `metrics[target.id].toolColumns[toolKind]`: `(target.x + column.left + column.width / 2, target.y)`.
  - Otherwise: `(target.x + target.width / 2, target.y)`.

### Base path

1. Exit stub: straight down `EXIT_LEN` from source anchor.
2. Vertical/horizontal dogleg to align with the target anchor x.
3. Entry stub: straight down into the target anchor.

For the common case (target roughly below source) this is a 3-segment path:

```
S(x0,y0) -> (x0, ym) -> (x1, ym) -> T(x1, y1)   with ym = y0 + EXIT_LEN + (y1 - y0 - 2*EXIT_LEN) / 2
```

If the target is above or beside the source (subagent layouts), fall back to side-exit routing: exit left or right from the source at `EXIT_LEN`, travel in a vertical lane, enter the target from the side.

### Obstacle avoidance

1. Build the obstacle set: all node rects + group rects, inflated by `OBSTACLE_PAD`, excluding source and target.
2. If any base segment intersects an obstacle, insert a detour: shift the horizontal trunk segment to the nearest free horizontal lane (`ym +- LANE_GAP` candidates, first non-colliding wins). If the vertical segments collide, shift them to a free vertical lane on the appropriate side (side A lanes drift left, side B lanes drift right, so parallel edges fan out instead of overlapping).
3. If total detour exceeds `MAX_DETOUR`, fall back to the plain dogleg (collision tolerated) - keeps the router O(n) per edge with no pathological blowups.

### Parallel edge spacing

Edges sharing the same (source, corridor) get deterministic lane offsets: sort by target x, assign offsets `i * LANE_GAP - (n-1) * LANE_GAP / 2` applied to the trunk segment, so fan-out edges never overlap.

### Corner rounding

Emit `Q` quadratic segments at each interior corner with radius `min(CORNER_R, adjacentSegmentLength / 2)`.

## 4. Model edges (`routeModelEdge`)

Model edges connect a prompt/side node's **model anchor** to a model node. They are visually distinct (dashed, accent color) and route mostly horizontally.

### Anchors

- Source anchor: `(source.x + source.width, source.y + metrics[source.id].modelAnchorY)` for right-exit (side B models), or `(source.x, ...)` for left-exit (side A models). If `modelAnchorY` is not measured yet, use `source.height * 0.4`.
- Target anchor, chosen by relative position:
  - Model below/right of source: model top-center.
  - Model outboard (roughly same Y): the model's left or right edge midpoint facing the source.

### Candidate scoring

Generate up to 4 candidate paths (direct horizontal-then-vertical, vertical-then-horizontal, left-lane detour, right-lane detour). Score each:

```
score = totalLength * 1.0
      + bends * 25
      + obstacleIntersections * 1000
      + conflictsWithAlreadyRoutedModelEdges * 40
```

Pick the lowest score. Routing is sequential in input order and each accepted path registers its segments in a shared occupancy map, so later model edges avoid stacking on earlier ones.

## 5. Rendering (CanvasEdges)

One `<svg>` absolutely positioned at `(0,0)` spanning `layout.bounds` (plus padding), `overflow: visible`, `pointer-events: none` (edges are not clickable; hover is driven by node hover).

Per edge:

```html
<path
  :d="routed.d"
  fill="none"
  :stroke="colorFor(routed)"
  :stroke-width="widthFor(routed)"
  :stroke-dasharray="routed.kind === 'model' ? theme.edge.modelDashArray : undefined"
  :class="{ 'is-highlighted': isConnected(routed, selectedNodeId), 'is-hovered': isConnected(routed, hoveredNodeId) }"
/>
```

Visual values (all from `CanvasTheme.edge`, the swappable layer):

| State | Width |
|---|---|
| normal | 1.5 |
| connected to selected node | 2 |
| connected to hovered node | 2.25 |

Color resolution order:

1. `kind === 'model'` -> `theme.edge.colors.model` (purple accent)
2. `toolKind === 'subagent'` or `handoff` -> `theme.edge.colors.subagent` (emerald)
3. `sideId === 'a'` -> `theme.edge.colors.sideA` (sky)
4. `sideId === 'b'` -> `theme.edge.colors.sideB` (amber)
5. otherwise -> `theme.edge.colors.default` (neutral)

When a node is hovered, edges not touching it or its neighbors dim to `theme.node.hoverDimOpacity` (0.25) along with the nodes - handled by the parent via a CSS class on the svg.

## 6. Recompute triggers

`buildEdgePaths` is memoized on `(nodes, edges, groups, metrics)` referential identity and recomputes when:

1. Layout is regenerated (agent load, refresh after save).
2. `useNodeMeasurement` emits updated metrics (first measure, resize, `refreshEpoch` bump).
3. A group expands/collapses (multi-instance focus).

Selection/hover changes never recompute paths - only stroke attributes.

## 7. Performance contract

- O(E * N) worst case (E edges, N obstacles). Canvas compositions are < 100 nodes / < 150 edges, so full recompute is sub-millisecond to few ms.
- No DOM access inside the router. All geometry comes from layout + metrics.
- Router must be pure: same input, same output, no module-level mutable state except the per-call occupancy map.
