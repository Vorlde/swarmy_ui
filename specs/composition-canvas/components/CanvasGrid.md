# CanvasGrid

Project: **swarmy_ui**. Background dot grid for the canvas viewport.

## Purpose

Renders an SVG `<pattern>` of dots across the viewport. Pure decoration; sits below all content and does not transform with pan/zoom (screen-space pattern).

## Props

None.

## Emitted events

None.

## Slots

None.

## API calls

None.

## Visual behavior

Full-size inline `<svg>` with `position: absolute; inset: 0`, rendered **outside** the transform layer so
the dots stay 24px apart on screen at every zoom level (verified identical at 11% and 51%):

```html
<pattern id="canvas-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
  <circle cx="12" cy="12" r="1" class="fill-neutral-400/20 dark:fill-neutral-500/20" />
</pattern>
```

plus a `<rect>` filling the viewport with `fill="url(#canvas-dot-grid)"`. The id must be exactly
`canvas-dot-grid`.

The **group sub-grid** is a different pattern and *is* inside the transform layer (so it scales with the
content): `width=20 height=20`, `<circle r="0.75" class="fill-neutral-400/15">`. It is rendered by the
group container, not by CanvasGrid.

## States

None (always rendered; decorative).

## Theming

All three visual values (dot color, spacing, radius) come from `theme.grid`. Alternative looks - line grid, graph-paper double grid, no grid - are implemented by swapping the pattern definition in a theme variant component; nothing else references CanvasGrid internals.
