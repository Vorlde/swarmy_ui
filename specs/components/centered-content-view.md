# Component Spec: CenteredContentView

## Purpose

Layout wrapper that constrains page content to a readable max width, centers it horizontally, and applies consistent page padding. Every top-level view that is not a split-pane canvas wraps itself in this component.

## Props

```ts
withDefaults(defineProps<{
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";  // default "7xl"
  padding?: boolean;                                              // default true
  scroll?: boolean;                                               // default true: vertical scroll container
}>(), { maxWidth: "7xl", padding: true, scroll: true });
```

## Emits

None.

## Slots

- default - page content

## Behavior

- Renders a full-height wrapper; with `scroll` enabled it is the vertical scroll container (`overflow-y-auto`) so inner sticky headers work predictably.
- Content is centered with auto margins and clamped by the `maxWidth` preset.
- `padding` applies the standard page gutter on all sides.

## States

- **Loading**: n/a (callers place a `Loader` inside the slot).
- **Empty**: renders the empty padded container; callers own empty-state content.
- **Error**: n/a.
- **Disabled**: n/a.

## Theming / Swappability

All values are tokens: the width presets map to the breakpoint scale (`--container-*` tokens, default `7xl` = 80rem), page padding maps to `--page-padding` (default 8 spacing units), and the surface is `--color-background`. Switching density or content width globally is a one-token change; a marketing-style wide theme and a compact admin theme can coexist by overriding `--page-padding` and the container scale per theme.

## API Endpoints

None. Pure layout component.
