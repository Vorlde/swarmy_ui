# Composition Canvas - Build Plan

Project: **swarmy_ui**. Ordered build steps with dependencies. Each step should compile and be demoable before moving on. The engine (steps 1-6) is theme-independent; the card visuals (step 7) consume the theme and can be replaced later without touching the engine.

## Phase 0 - Foundations

### 0.1 Types + theme + node registry
- Write `types.ts` from `domain-model.md` (Bounds, CompositionLayout, `NodeKind` = `agent | prompt | human | function | subagent | model`, CanvasNode union discriminated on **`kind`**, CanvasEdge, CanvasGroup, NodeMetrics, Measurement, EditTarget, CanvasTheme).
- Write `nodeRegistry.ts` - a plain `Record<NodeKind, Component>`. Every later phase adds cards by registering them here; no template ever branches on kind.
- Write `defaultCanvasTheme.ts` mapping CanvasTheme to design tokens (edge colours all neutral, `elevation: 'none'`, `sideAccent` sky/amber, group `#f7f7f7` r=8).
- Set up `provide('canvasTheme', theme)` and `provide('nodeRegistry', registry)` at the CompositionView root.
- No dependencies.

### 0.2 Fixture data
- Hand-write 2-3 `CompositionLayout` fixtures: minimal (1 agent, 1 side, 1 tool, 1 model), dual-AI (2 sides, several tools, hooks, 2 models), subagent (nested group).
- These drive development before the API client exists.

## Phase 1 - Viewport engine

### 1.1 `usePanZoom` (depends on 0.1)
- Implement per `panzoom.md`: state (translate in **canvas units**), wheel (passive:false), pointer pan with 6px threshold, clamping, snap debounce, zoom-to-cursor, fitToView/focusNode/resetView, save/restoreViewport, auto-fit lock, rAF animations.
- **Single transform strategy**: `transform: translate3d(x,y,0)` + CSS `zoom: scale` + `transform-origin: 0 0` + `transition: opacity 200ms ease-out`. No `transform: scale()`, no mode switching on `isPanning`. Get the coordinate math from `panzoom.md` Section 2 - it differs from a `scale()` implementation.
- `zoomIn`/`zoomOut` step `+-0.04`; default view is fit-to-content (11% for the reference agent).
- Demo: a plain div canvas with colored rects and 11px text; verify pan, zoom, fit, keyboard, **and that text stays crisp at 11% and 200%** (the acceptance test for `zoom` vs `scale`).

### 1.2 `CanvasGrid` (depends on 0.1)
- Inline SVG `<pattern id="canvas-dot-grid" width=24 height=24><circle cx=12 cy=12 r=1 class="fill-neutral-400/20 dark:fill-neutral-500/20">`, rendered **outside** the transform layer so spacing stays 24px on screen at every zoom. Verify by comparing 11% and 51%.
- The 20px group sub-grid (`r=0.75`, `fill-neutral-400/15`) belongs to the group container, inside the layer.

## Phase 2 - Measurement + edges

### 2.1 `useNodeMeasurement` (depends on 0.1)
- ResizeObserver per node element; `measureNode(id, el)` registration; scan for `data-model-anchor` and `data-tool-column="<kind>"`; emit `nodes-measured` when all non-hook nodes reported; expose `nodeMetrics`, `measuredBounds`, `layoutStable`.

### 2.2 Edge router v0 (straight doglegs) (depends on 0.1)
- `buildEdgePaths` with the structural 3-segment dogleg only, no avoidance. Get pixels on screen early.

### 2.3 `CanvasEdges` (depends on 2.2, 2.1)
- SVG layer, color/width resolution from theme, highlight/dim classes driven by selected/hovered ids.

### 2.4 Edge router full (depends on 2.3)
- Add obstacle avoidance, lane spacing, side-exit fallback, corner rounding, then `routeModelEdge` with candidate scoring and occupancy map. Unit-test against fixtures: assert no segment intersects inflated obstacle rects in fixture layouts.

## Phase 3 - Nodes

### 3.1 Shared cards (depends on 0.1)
- `AgentLockupCard`, `PromptCard`, `FunctionToolCard`, `EditRegion`, `VariablesList`. Pure presentational, theme-driven, typed props/emits per component specs. Flat, border-only, **no `box-shadow`** anywhere.

### 3.2 Node components + registry entries (depends on 3.1, 2.1)
- Build and register the six kinds: `agent` -> AgentNode, `prompt` / `human` -> SidePromptNode, `subagent` -> AgentLockupCard, `model` -> ModelNode, `function` -> ToolNode (last; lazy detail fetch).
- Each registers itself with measurement, emits `select` / `edit-surface` / hover, and stamps `data-canvas-node`, `data-canvas-node-id`, plus `data-model-anchor` / `data-variables-section` / `data-tool-column` / `data-canvas-model-node` where applicable.
- `HookNode` is **not** registered - no hook card exists in the reference.

## Phase 4 - Canvas assembly

### 4.1 `CompositionCanvas` (depends on 1.1, 2.1, 2.4, 3.2, 1.2, 2.3)
- Wire pan/zoom + measurement + edges + groups + `<component :is="nodeRegistry[node.kind]">`. Groups are solid-bordered `[data-canvas-group]` containers on `#f7f7f7` (r=8) with a label chip, badges, and their own 20px dot sub-grid.

### 4.2 Selection behavior (depends on 4.1)
- `useCanvasSelection`: click select, double-click focus (1.2x), click-empty deselect + restoreViewport, group click focus, hover neighbor dimming (opacity 0.25).

### 4.3 `CanvasControls` (depends on 1.1)
- `absolute bottom-4 left-4 z-10 rounded-lg`: `-`, scale percent readout, `+`, divider, fit-to-screen. Four controls, no lock indicator.

## Phase 5 - Data + orchestration

### 5.1 API client + composition store (depends on 0.1)
- Typed client for endpoints in `api-binding.md`; store holding catalogs, selected agent, layout, refreshEpoch; `refreshComposition()`; route sync with `?agent=` param.

### 5.2 Layout generator `buildCompositionLayout` (depends on 5.1)
- Implement per domain-model Section 8. Verify determinism against fixtures; verify measured-size feedback loop (layout uses estimates, measurement corrects anchors, edges recompute).

### 5.3 `CompositionView` (depends on 5.2, 4.2)
- Full mount lifecycle per api-binding Section 1, loading/empty/error states, refresh wiring. Mount the Structure pane as cascade snap section 3: one shared header `Structure  <agent name>`, `.structure-tree` + `.structure-tree-resizer` + canvas viewport.

## Phase 6 - Panels and tree

### 6.1 `AgentBrowserPanel` (depends on 5.1)
- Selection contract only; the agents grid itself is specced under `specs/views/`. Active row sync with `?agent=`.

### 6.2 `StructureTree` + `StructureTreeRow` + `DataTreeView` + `DataTreeRow` (depends on 5.1, 4.2)
- Tree projection of the same composition; row select -> canvas select + focusNode. Resizable width persisted to `localStorage['composition.structureTreeWidth']`.

### 6.3 `InspectorPanel` (depends on 5.1, 4.2)
- Lives in snap section 2, not next to the canvas; see the note at the top of `InspectorPanel.md` before building it.

## Phase 7 - Packaging modals

### 7.1 `DependencyTree`, `UnpackTree`, `ExtractCopyToggle` (depends on 5.1)
- Shared tree components for pack/unpack analysis results.

### 7.2 `PackModal` (depends on 7.1)
- analyze -> configure -> pack flow per api-binding Section 2.

### 7.3 `UnpackModal` (depends on 7.1)
- package id input -> analyze -> unpack flow.

### 7.4 `PublishModal` (depends on 7.2)
- token status check -> publish; success state with registry URL.

## Phase 8 - Hardening

- Unit tests: router (fixtures), layout generator (determinism, bounds), panzoom math - specifically `screen = (canvas + translate) * scale` round-tripping and zoom-to-cursor invariance, since the CSS-`zoom` convention is easy to regress into `scale()` math.
- E2E: load fixture composition, assert node count, edge path count via `[data-edge-id]`, node lookup via `[data-canvas-node-id]`, selection/focus behavior, pack modal flow with mocked API.
- Visual: assert the transform layer's computed style contains `zoom` and **no** `scale(` in `transform`; assert no canvas element has a non-`none` `box-shadow`.
- Performance: verify full recompute < 16ms at 100 nodes; ResizeObserver churn under control during refresh.
- Theme swap drill: replace defaultCanvasTheme with a high-contrast theme; verify zero engine changes needed.
- Registry drill: add a throwaway `kind` + component to `nodeRegistry` and confirm it renders with no edit to `CompositionCanvas`.

## Dependency graph (compact)

```
0.1 types/theme --+--> 1.1 panzoom ------> 4.1 canvas
                  +--> 1.2 grid ---------> 4.1
                  +--> 2.1 measurement --> 2.3 edges --> 2.4 router --> 4.1
                  +--> 2.2 router v0 ----> 2.3
                  +--> 3.1 cards --------> 3.2 nodes --> 4.1
4.1 --> 4.2 selection --> 4.3 controls
5.1 api/store --> 5.2 layout --> 5.3 view (uses 4.x)
5.1 --> 6.1 browser, 6.2 trees, 6.3 inspector
5.1 --> 7.1 trees --> 7.2 pack --> 7.3 unpack, 7.4 publish
```
