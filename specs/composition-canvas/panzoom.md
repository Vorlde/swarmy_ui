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
  x: number;      // translate X, in CANVAS units (see Section 2 - the layer uses CSS `zoom`)
  y: number;      // translate Y, in CANVAS units
  scale: number;  // zoom factor, clamped [minScale, maxScale]; fed to CSS `zoom`
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

The transform layer scales with the CSS **`zoom`** property, not `transform: scale()`. That changes the
math, so read this before writing any pointer handler.

With `zoom: s` on the layer, the browser multiplies every computed length inside that layer - including
the layer's own `transform` translation - by `s`. So the layer is already laid out in scaled pixels, and
`translate3d(tx, ty, 0)` moves it by `tx * s` screen px. **`state.x` / `state.y` are therefore in canvas
units, not screen units.**

```ts
// canvas -> screen (container-relative)
screenX = (canvasX + state.x) * scale
screenY = (canvasY + state.y) * scale

// screen -> canvas (used by zoom-to-cursor and hit testing)
canvasX = screenX / scale - state.x
canvasY = screenY / scale - state.y
```

Consequences to carry through every handler:

- A pan of `d` **screen** px is `state.x += d / scale`, not `state.x += d`.
- Zoom-to-cursor keeps the canvas point under the cursor fixed:
  `state.x += cx * (1 / newScale - 1 / scale)` (same for y). No `k = newScale / scale` factor.
- Keyboard/arrow pan steps and clamping padding, which are naturally expressed in screen px, must be
  divided by `scale` before being applied to `state.x/y`.

`screenX/screenY` are container-relative (clientX minus container `getBoundingClientRect().left`).

## 3. Interaction model

### Pointer pan (mouse / touch / pen)

- `onPointerDown`: record start point, start translate, and pointer id. Do not capture yet. Only primary button (0) or middle button (1) start a pan; events originating inside a node card are ignored because nodes call `@pointerdown.stop` (nodes handle their own clicks).
- `onPointerMove`: once movement exceeds **6px**, set `isPanning = true` and call `setPointerCapture`. Update `state.x/y = startTranslate + delta / scale` (the screen-space pointer delta is divided by `scale`, per Section 2), clamped by Section 5.
- `onPointerUp` / `onPointerCancel`: release capture, `isPanning = false`, then run the snap debounce (Section 6).
- `shouldHandleClick()`: returns false when the last gesture exceeded the 6px threshold, so `click` handlers on the canvas background do not deselect after a pan.

### Wheel

Attach with `{ passive: false }` on the container; remove on unmount.

- **Ctrl or Meta + wheel**: zoom. `newScale = clamp(scale * Math.exp(-deltaY * 0.0015))`. Zoom toward the cursor: keep the canvas point under the cursor stationary:

```ts
const cx = e.clientX - rect.left;
const cy = e.clientY - rect.top;
// canvas point under the cursor must not move: cx / s - x is invariant
state.x += cx * (1 / newScale - 1 / state.scale);
state.y += cy * (1 / newScale - 1 / state.scale);
state.scale = newScale;
```

- **Plain wheel / trackpad two-finger scroll**: pan. `state.x -= deltaX / state.scale; state.y -= deltaY / state.scale`, clamped.
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
| Arrow keys | pan by 80 screen px (i.e. `state.x/y +- 80 / scale`) |
| `Escape` | handled by parent: deselect + restoreViewport() |

### Zoom controls

`zoomIn()` / `zoomOut()` step the scale **additively in ~4-percentage-point increments** (`scale +- 0.04`,
clamped), animated toward the container center over 150ms. This is why the readout walks 11% -> 51%
over twelve `+` clicks in the reference capture, rather than the geometric x1.25 a `scale()` canvas
would use.

## 4. Transform strategy (crisp text)

**One** render mode, always. Pan is a `translate3d`; zoom is the CSS `zoom` property. There is no
`transform: scale()` and no combined matrix - `zoom` makes the browser lay the subtree out at the target
size, so text, borders and hairlines are rasterised at device resolution at every zoom level. Nothing
switches on `isPanning`.

The transform layer is `class="absolute origin-top-left will-change-transform"` with:

```css
transform: translate3d(${x}px, ${y}px, 0);   /* x, y in canvas units - see Section 2 */
zoom: ${scale};
transform-origin: 0 0;
transition: opacity 200ms ease-out;
```

`transformStyle` recomputes from `state` alone. Note the `transition` covers **opacity only**; transform
and zoom are never transitioned (programmatic moves are driven by the rAF loop in Section 8).

## 5. Pan clamping

Given `contentBounds` (from `setContentBounds`, typically `layout.bounds`) and container size `(cw, ch)`
in screen px. Because `state.x/y` are canvas units, the screen-space padding `p` is divided by `scale`:

```ts
const p = panPadding;
minX = (cw - p) / scale - (contentBounds.x + contentBounds.width)
maxX = p / scale - contentBounds.x
minY = (ch - p) / scale - (contentBounds.y + contentBounds.height)
maxY = p / scale - contentBounds.y
state.x = clamp(state.x, minX, maxX)
state.y = clamp(state.y, minY, maxY)
```

If the content is smaller than the container on an axis, center it on that axis instead of clamping.

## 6. Snap debounce

After panning ends, debounce 120ms, then snap the translate so the layer's origin lands on a whole
device pixel: `state.x = Math.round(state.x * scale) / scale` (same for y). With CSS `zoom` the *content*
is already crisp; this only removes a half-pixel offset on the layer origin.

## 7. Auto-fit lock and viewport memory

- `fitToView(bounds)` computes `scale = min((cw - 2*padding) / bounds.width, (ch - 2*padding) / bounds.height, maxScale)` (also `>= minScale`) and centers the bounds, animated (300ms ease-out cubic via `requestAnimationFrame`). Centering in canvas units: `state.x = cw / (2 * scale) - (bounds.x + bounds.width / 2)` (same for y).
- This is the **default view on mount**: fit-to-content. For the reference agent (`order_support_agent`) it lands on **11%**, which is what the controls read out before any interaction.
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

The viewport shell is `relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50`; the
pointer surface inside it is `absolute inset-0 cursor-grab` (`cursor-grabbing` while `isPanning`).

```vue
<div class="relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50">
  <CanvasGrid />  <!-- screen-space dot pattern, outside the transform layer -->
  <div
    ref="containerRef"
    tabindex="0"
    class="absolute inset-0 cursor-grab"
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
  <CanvasControls ... />  <!-- absolute bottom-4 left-4 z-10 -->
</div>
```

`pz.transformStyle` yields exactly `{ transform: 'translate3d(Xpx, Ypx, 0)', zoom: scale, transformOrigin: '0 0', transition: 'opacity 200ms ease-out' }`.

Wheel is bound in `onMounted` with `addEventListener('wheel', pz.onWheel, { passive: false })` and removed in `onBeforeUnmount`.

## 10. Edge cases

- Container resize: re-clamp translate; if auto-fit lock is unset, refit.
- `setContentBounds(null)` disables clamping (loading state).
- Scale exactly at min/max: zoom controls disable the corresponding button.
- Middle-click drag pans without requiring pointer capture threshold on some browsers; treat button 1 identically to button 0.
