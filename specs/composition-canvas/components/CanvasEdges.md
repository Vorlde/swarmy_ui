# CanvasEdges

Project: **swarmy_ui**. SVG layer that renders all edges as orthogonal polylines with rounded elbows (axis-aligned runs joined by short arcs) - not free-form cubic beziers.

## Purpose

Pure render component. Takes nodes, edges, groups, and runtime `NodeMetrics` and produces one `<path>` per edge using the routing rules in `edge-routing.md`. No interaction; `pointer-events: none`.

## Props

```ts
interface Props {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  nodeMetrics?: NodeMetrics;  // measured anchors (modelAnchorY, toolColumns)
}
```

## Emitted events

None.

## Slots

None.

## API calls

None.

## Visual behavior

- Single `<svg>` positioned absolute at 0,0 with `overflow: visible`; paths live in canvas space.
- Each `<path>` carries `data-edge-id`, `data-edge-kind`, and `data-edge-tool-kind` when set.
- `structural` edges: solid stroke, source bottom-center to target top-center (or per-kind tool column top via `nodeMetrics[from].toolColumns[kind]`).
- `model` edges: dashed (`theme.edge.modelDashArray`), from `nodeMetrics[id].modelAnchorY` (the inline model chip in the PROMPT card header) to the model node top or side anchor.
- Stroke color resolution order: kind `model` -> `theme.edge.colors.model`; toolKind `subagent` -> `colors.subagent`; else `colors.sideA`/`colors.sideB` by `sideId`; fallback `colors.default`. **The shipped theme maps all five to the same neutral (~`#dcdcdc`)** - every edge in the reference is neutral grey; only the dash array distinguishes model edges. Side identity lives on the node card border, not the edge.
- Stroke width: base `theme.edge.strokeWidth`; `highlightedWidth` when the edge touches the selected node; `hoveredWidth` when it touches the hovered node.
- Edges adjacent to the hovered node stay opaque; others fade with the global hover dim.

## States

- **Empty**: renders nothing when `edges` is empty (valid for a bare agent).
- No loading or error states; missing metrics fall back to geometric anchors.

## Theming

Every stroke attribute comes from `theme.edge` in the injected `CanvasTheme`: widths, dash array, and the five-color palette. Rebranding edge colors (e.g. side A blue to brand primary) is a token change only; path geometry is theme-independent.
