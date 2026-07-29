# CanvasControls

Project: **swarmy_ui**. Floating zoom control cluster.

## Purpose

Overlay toolbar (default bottom-right, configurable corner) with zoom out, scale readout, zoom in, fit-to-view, and an auto-fit-lock indicator.

## Props

```ts
interface Props {
  scalePercent: number;   // current zoom * 100, rounded
  autoFitLocked?: boolean; // true after the user manually pans/zooms
  minScale?: number;       // disables zoom-out at floor
  maxScale?: number;       // disables zoom-in at ceiling
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `zoom-in` | - | + button (parent applies step zoom toward viewport center) |
| `zoom-out` | - | - button |
| `fit-view` | - | fit button (also clears auto-fit lock) |
| `reset-lock` | - | lock indicator clicked |

## Slots

None.

## API calls

None.

## Visual behavior

Horizontal pill: `[-] [100%] [+] [fit]`. The percent readout is `tabular-nums`, min-width 3rem. The lock indicator lights when `autoFitLocked` is true. Buttons disable at scale bounds. Clicking the percent readout also emits `fit-view`.

## States

- Disabled buttons at min/max scale (reduced opacity, no pointer events).
- No loading/error states.

## Theming

Pill chrome (background, border, blur, shadow, radius) uses shared surface tokens (`--color-surface`, `--color-border`, `--radius-lg`, `--shadow-sm`). Icon set and pill shape are theme-swappable; the emit contract stays identical, so a vertical toolbar variant or icon-only compact variant is a drop-in replacement.
