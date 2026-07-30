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

All values are tokens: the width presets map to the breakpoint scale (`--container-*` tokens, default `7xl` = 80rem), page padding maps to `--page-padding`, and the surface is the page background (`bg-neutral-50/80` over white in light, `dark:bg-black` in dark) - the wrapper does not paint its own opaque `--color-background`.

Measured (viewport 1512, CSS px) across `prompts`, `models`, `providers`, `tools`, `settings-users`, `settings-api-keys`, `settings-my-variables`, `settings-instance-variables`: `main` begins at x `240` (its `1px --color-border` left rule) and the content column runs x `272.5` -> `1462`. That is a **`32px` page gutter** on both sides (`--page-padding` = `8` spacing units = `32px`), giving a `1189px` content width. At 1512 the content is narrower than the `7xl` clamp, so the `maxWidth` preset is not exercised in the capture - only the gutter is an observed fact.

Switching density or content width globally is a one-token change; a marketing-style wide theme and a compact admin theme can coexist by overriding `--page-padding` and the container scale per theme.

## API Endpoints

None. Pure layout component.
