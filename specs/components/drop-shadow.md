# Component Spec: DropShadow

## Purpose

Decorative wrapper that draws a stylized offset shadow behind its content on a canvas. Instead of a blurred CSS shadow it renders a crisp patterned shadow (crosshatch, dots, or diagonal lines) clipped to the content's rounded-rect silhouette, giving cards a distinctive hard-edge elevation. Redraws automatically on resize and theme change.

## Props

```ts
withDefaults(defineProps<{
  offsetX?: number;                        // shadow offset right, px; default 8
  offsetY?: number;                        // shadow offset down, px; default 8
  intensity?: number;                      // 0-1 alpha / pattern density; default 0.5
  pattern?: "crosshatch" | "dots" | "diagonal";  // default "crosshatch"
  elevation?: "none" | "sm" | "md" | "lg"; // optional preset; overrides offset/intensity when set
}>(), { offsetX: 8, offsetY: 8, intensity: 0.5, pattern: "crosshatch" });
```

## Emits

None.

## Slots

- default - the elevated content (first element child's border radius is sampled for the silhouette)

## Behavior

- The wrapper reserves `offsetX`/`offsetY` as right/bottom padding and positions an absolutely-placed canvas behind the content.
- On mount and on every relevant change it measures the content box, samples the first child's computed `border-radius`, and draws the chosen pattern clipped to that rounded-rect path translated by the offsets.
- A `ResizeObserver` on the content and a `MutationObserver` on the root `.dark` class trigger redraws, as do prop changes; both observers disconnect on unmount.
- Pattern rendering is pure canvas 2D: crosshatch strokes both diagonal directions, dots use a deterministic 4x4 threshold matrix scaled by `intensity`, diagonal strokes one direction. Stroke/fill color follows the shadow color token (dark-mode aware).
- The canvas is `pointer-events: none`; it never interferes with interaction.

## States

- **Loading**: n/a (draws synchronously after mount).
- **Empty**: no slotted content; canvas draws nothing.
- **Error**: missing 2D context (very old browsers); component degrades to no shadow.
- **Disabled**: `elevation="none"` skips drawing entirely.

## Theming / Swappability

Shadow ink is token-driven: `--dropshadow-color` (default black light / `#6b7280` dark) and `--dropshadow-color-dark`, plus `--dropshadow-line-width`. The `elevation` presets map to theme tokens `--elevation-sm/md/lg`, each a `{offsetX, offsetY, intensity}` triple, so a theme can dial elevation globally or switch the default pattern via `--dropshadow-pattern` without touching logic. Canvas DPI scaling follows `devicePixelRatio` automatically for crisp lines on retina displays.

## API Endpoints

None. Pure presentational component.
