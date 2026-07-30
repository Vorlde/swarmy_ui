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

Variants resolve entirely through tokens.

**`primary` is the inverted neutral, not the accent.** Measured on the page primary actions (`+ Create Prompt`, `+ Add Model`, `Add User`, `Create API Key`, `Save Variables`, `+ Add Property`, `Sign in`): fill `#000000` with a white label in light theme, and the mirror (white fill, black label) in dark. Bind it to a `--btn-primary-bg` / `--btn-primary-fg` token pair that defaults to `--color-neutral-950` / `--color-background` and inverts under `.dark`. Changing the accent ramp must **not** recolor the primary button - accent drives selection surfaces, underline tabs, and focus rings instead.

`secondary` uses `--color-background-mute` with `--color-text`; `ghost` is transparent with `--color-background-mute` hover; `danger` uses the red semantic scale. Focus ring color and offset are `--focus-ring-color` / `--focus-ring-width` (accent-derived).

Measured geometry for the `md` page-primary preset (viewport 1512, CSS px): height `36px`, radius `8px` (`--radius-lg`), horizontal padding `~20px`, icon/label gap `~10px`, label `14px` at `--font-weight-medium`. `Sign in` on `/login` is the same preset with `fullWidth`. The sm/md/lg scale maps to `--btn-height-sm/md/lg` and `--btn-padding-x-*`, so a compact or roomy theme is a token change, not a component change.

Buttons carry **no** `box-shadow` in any state; in this app the only CSS shadow is `shadow-sm` on the theme-toggle knob, and panel/overlay depth comes from `DropShadow`.

## API Endpoints

None. Pure presentational component.
