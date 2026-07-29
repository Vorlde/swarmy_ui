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

Full-size `<svg>` with `position: absolute; inset: 0`. A `<pattern>` of size `theme.grid.dotSpacing` draws one `<circle>` of radius `theme.grid.dotRadius` filled with `theme.grid.dotColor`, plus a `<rect>` filling the viewport with the pattern.

## States

None (always rendered; decorative).

## Theming

All three visual values (dot color, spacing, radius) come from `theme.grid`. Alternative looks - line grid, graph-paper double grid, no grid - are implemented by swapping the pattern definition in a theme variant component; nothing else references CanvasGrid internals.
