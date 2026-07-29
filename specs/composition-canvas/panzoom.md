# Composition Canvas - Pan/Zoom System

Project: **swarmy_ui**. A single composable, `usePanZoom`, owns all viewport state. It is stable engine code: it knows nothing about themes, nodes, or edges.

## 1. Signature

```ts
import type { Ref, CSSProperties } from 'vue';
import type { Bounds } from './types';

export interface PanZoomOptions {
  minScale?: number;   // default 0.1
  maxScale?: number;   // default 2.5
  padding?: number;    // default 80 - fit-to-view padding (px, screen space)
  panPadding?: number; // default = padding - how far content can be dragged past the viewport edge
}

export interface ViewportState {
  x: number;      // screen-space translate X (px)
  y: number;      // screen-space translate Y (px)
  scale: number;  // zoom factor, clamped [minScale, maxScale]
}

export interface PanZoomAPI {
  state: Ref<ViewportState>;
  isPanning: Ref<boolean>;
  transformStyle: Ref<CSSProperties>;
  scalePercent: Ref<number>;               // Math.round(scale * 100), for the controls label

  onWheel: (e: WheelEvent) => void;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  shouldHandleClick: () => boolean;        // false if the pointer moved > 6px (was a pan, not a click)

  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: (bounds: Bounds, opts?: { force?: boolean }) => void;
  resetAutoFitLock: () => void;
  focusNode: (node: Bounds, scale?: number) => void;  // default scale 1.2
  resetView: () => void;
  setContentBounds: (bounds: Bounds | null) => void;
  saveViewport: () => void;
  restoreViewport: () => void;
}

export function usePanZoom(
  containerRef: Ref<HTMLElement | null>,
  options?: PanZoomOptions
): PanZoomAPI;
```

## 2. Coordinate conversion

```ts
// canvas -> screen
screenX = canvasX * scale + state.x
screenY = canvasY * scale + state.y

// screen -> canvas (used by zoom-to-cursor and hit testing)
canvasX = (screenX - state.x) / scale
canvasY = (screenY - state.y) / scale
```

`screenX/screenY` are container-relative (clientX minus container `getBoundingClientRect().left`).

## 3. Interaction model

### Pointer pan (mouse / touch / pen)

- `onPointerDown`: record start point, start translate, and pointer id. Do not capture yet. Only primary button (0) or middle button (1) start a pan; events originating inside a node card are ignored because nodes call `@pointerdown.stop` (nodes handle their own clicks).
- `onPointerMove`: once movement exceeds **6px**, set `isPanning = true` and call `setPointerCapture`. Update `state.x/y = startTranslate + delta`, clamped by Section 5.
- `onPointerUp` / `onPointerCancel`: release capture, `isPanning = false`, then run the snap debounce (Section 6).
- `shouldHandleClick()`: returns false when the last gesture exceeded the 6px threshold, so `click` handlers on the canvas background do not deselect after a pan.

### Wheel

Attach with `{ passive: false }` on the container; remove on unmount.

- **Ctrl or Meta + wheel**: zoom. `newScale = clamp(scale * Math.exp(-deltaY * 0.0015))`. Zoom toward the cursor: keep the canvas point under the cursor stationary:

```ts
const cx = e.clientX - rect.left;
const cy = e.clientY - rect.top;
const k = newScale / state.scale;
state.x = cx - (cx - state.x) * k;
state.y = cy - (cy - state.y) * k;
state.scale = newScale;
```

- **Plain wheel / trackpad two-finger scroll**: pan. `state.x -= deltaX; state.y -= deltaY`, clamped.
- Always `preventDefault()` so the page never scrolls.
- Any manual wheel interaction sets the auto-fit lock (Section 7).

### Touch

Single-pointer touch pans via the same pointer handlers. Pinch zoom: track two active pointers in a map; on move compute the ratio of current to previous inter-pointer distance, multiply scale, and zoom toward the midpoint. (Pinch is best-effort; desktop is the primary target.)

### Keyboard

On the container (`tabindex="0"`):

| Key | Action |
|---|---|
| `+` / `=` | zoomIn() |
| `-` | zoomOut() |
| `0` | fitToView(contentBounds, { force: true }) |
| Arrow keys | pan by 80px (screen space) |
| `Escape` | handled by parent: deselect + restoreViewport() |

### Zoom controls

`zoomIn()` / `zoomOut()` step scale by x1.25 / /1.25, animated toward the container center over 150ms.

## 4. Transform strategy (crisp text)

Two render modes, switched by `isPanning`:

- **While panning** (or mid-animation): GPU-composited transform.

```css
transform: translate3d(${x}px, ${y}px, 0) scale(${scale});
transform-origin: 0 0;
```

- **Idle**: CSS `zoom` keeps text and borders rendered at device resolution instead of scaled raster.

```css
transform: translate3d(${x / scale}px, ${y / scale}px, 0);
zoom: ${scale};
```

`transformStyle` recomputes from `state` and `isPanning`. The swap happens on `pointerup` and at animation end; it is invisible because both expressions map canvas space to the same screen rect.

## 5. Pan clamping

Given `contentBounds` (from `setContentBounds`, typically `layout.bounds`) and container size `(cw, ch)`:

```ts
const p = panPadding;
minX = cw - (contentBounds.x + contentBounds.width)  * scale - p
maxX = -contentBounds.x * scale + p
minY = ch - (contentBounds.y + contentBounds.height) * scale - p
maxY = -contentBounds.y * scale + p
state.x = clamp(state.x, minX, maxX)
state.y = clamp(state.y, minY, maxY)
```

If the content is smaller than the container on an axis, center it on that axis instead of clamping.

## 6. Snap debounce

After panning ends, debounce 120ms, then round `state.x` and `state.y` to the nearest multiple of `scale`. This eliminates sub-pixel blur on node borders at common zoom levels.

## 7. Auto-fit lock and viewport memory

- `fitToView(bounds)` computes `scale = min((cw - 2*padding) / bounds.width, (ch - 2*padding) / bounds.height, maxScale)` (also `>= minScale`) and centers the bounds, animated (300ms ease-out cubic via `requestAnimationFrame`).
- The first `fitToView` after content loads always applies. Subsequent automatic calls (e.g. after refresh) are **no-ops once the user has manually panned or zoomed** (auto-fit lock). `{ force: true }` overrides.
- `resetAutoFitLock()` clears the lock (called when a new agent is loaded).
- `saveViewport()` stores a copy of `state` (e.g. before focusing a node). `restoreViewport()` animates back to it (used when the user deselects).
- `focusNode(node, scale = 1.2)` centers the given bounds at the requested scale with the same 300ms animation.
- `resetView()` = `fitToView(contentBounds, { force: true })`.

## 8. Animation

All programmatic viewport changes use one rAF loop:

```ts
const DURATION = 300; // ms
// ease-out cubic: t => 1 - Math.pow(1 - t, 3)
// interpolate x, y, scale from start to target; cancel any running animation on new input
```

User-driven gestures (wheel, drag) are never animated - they apply immediately.

## 9. Wiring in CompositionCanvas

```vue
<div
  ref="containerRef"
  tabindex="0"
  @pointerdown="pz.onPointerDown"
  @pointermove="pz.onPointerMove"
  @pointerup="pz.onPointerUp"
  @pointercancel="pz.onPointerUp"
  @click="pz.shouldHandleClick() && emit('deselect')"
  @keydown="onKeydown"
>
  <div class="absolute origin-top-left will-change-transform" :style="pz.transformStyle">
    <!-- groups, CanvasEdges, nodes -->
  </div>
</div>
```

Wheel is bound in `onMounted` with `addEventListener('wheel', pz.onWheel, { passive: false })` and removed in `onBeforeUnmount`.

## 10. Edge cases

- Container resize: re-clamp translate; if auto-fit lock is unset, refit.
- `setContentBounds(null)` disables clamping (loading state).
- Scale exactly at min/max: zoom controls disable the corresponding button.
- Middle-click drag pans without requiring pointer capture threshold on some browsers; treat button 1 identically to button 0.
