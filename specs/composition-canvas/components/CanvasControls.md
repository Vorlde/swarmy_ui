# CanvasControls

Project: **swarmy_ui**. Floating zoom control cluster.

## Purpose

Overlay control cluster pinned to the **bottom-left** of the canvas viewport with four controls in this
order: zoom out, scale readout, zoom in, fit-to-screen.

## Props

```ts
interface Props {
  scalePercent: number;   // current zoom * 100, rounded; reads "11%" at the default fit
  minScale?: number;       // disables zoom-out at floor
  maxScale?: number;       // disables zoom-in at ceiling
}
```

There is **no auto-fit-lock indicator** in the reference UI - the cluster is exactly four controls.

## Emitted events

| Event | Payload | When |
|---|---|---|
| `zoom-in` | - | `+` button (parent steps scale by ~+0.04 toward viewport center) |
| `zoom-out` | - | `-` button (~-0.04) |
| `fit-view` | - | fit-to-screen button (also clears auto-fit lock) |

## Slots

None.

## API calls

None.

## Visual behavior

Horizontal white pill: `absolute bottom-4 left-4 z-10 rounded-lg`. Contents:
`[-] [ 11% ] [+]` then a short vertical hairline divider, then the fit-to-screen button
(corner-brackets icon). Readout classes: `min-w-[3rem] text-center text-[11px] font-medium
tabular-nums text-neutral-500`. Buttons get a light rounded-square hover fill. Buttons disable at scale
bounds. Clicking the percent readout also emits `fit-view`.

## States

- Disabled buttons at min/max scale (reduced opacity, no pointer events).
- No loading/error states.

## Theming

Pill chrome (background, border, radius) uses shared surface tokens (`--color-surface`, `--color-border`, `--radius-lg`). **No `box-shadow`** - if the pill needs depth it uses the app-wide sibling-`<canvas>` diagonal-hatch shadow (6px right / 6px bottom), never a CSS shadow. Icon set and pill shape are theme-swappable; the emit contract stays identical, so a vertical toolbar variant or icon-only compact variant is a drop-in replacement.
