# Component Spec: UiButton

## Purpose

The single button used across all of swarmy_ui. Provides consistent variants, sizes, loading behavior, and focus treatment so no screen styles raw `<button>` elements.

## Props

```ts
withDefaults(defineProps<{
  variant?: "primary" | "secondary" | "ghost" | "danger";  // default "primary"
  size?: "sm" | "md" | "lg";                               // default "md"
  type?: "button" | "submit" | "reset";                    // default "button"
  loading?: boolean;                                       // shows spinner, blocks clicks
  disabled?: boolean;
  fullWidth?: boolean;
  form?: string;              // associate with a <form> by id
  iconOnly?: boolean;         // square padding for icon-only buttons (requires aria-label)
}>(), { variant: "primary", size: "md", type: "button" });
```

## Emits

- `click(event: MouseEvent)` - suppressed while `loading` or `disabled`

## Slots

- default - label content
- `icon-left` - leading icon (sized to `size`)
- `icon-right` - trailing icon

## Behavior

- `loading` renders a spinning loader in place of `icon-left`, sets `aria-busy`, and disables interaction.
- Disabled state sets `disabled` and `aria-disabled`, drops pointer events, and dims opacity.
- `fullWidth` stretches the button to its container.
- All sizing, spacing, and colors come from variant/size maps; no per-call-site overrides are needed.

## States

- **Loading**: spinner visible, label preserved (layout does not shift).
- **Empty**: n/a.
- **Error**: n/a (errors are shown via `UiAlertBox` next to the button).
- **Disabled**: 50% opacity, `cursor-not-allowed`, no hover effect.

## Theming / Swappability

Variants resolve entirely through tokens: primary uses `--accent-600` background with `--accent-700` hover and `--accent-500` focus ring; secondary uses `--color-background-mute` with `--color-text`; ghost is transparent with `--color-background-mute` hover; danger uses the red color scale. Radius is `--radius-lg`, font weight `--font-weight-medium`, and the sm/md/lg scale maps to `--btn-height-sm/md/lg` and `--btn-padding-x-*` tokens, so a compact or roomy theme is a token change, not a component change. Focus ring color and offset are `--focus-ring-color` / `--focus-ring-width`.

## API Endpoints

None. Pure presentational component.
