# Component Spec: DropShadow

## Purpose

Decorative wrapper that draws a stylized offset shadow behind its content on a `<canvas>`. Instead of a blurred CSS shadow it renders a crisp patterned shadow clipped to the content's rounded-rect silhouette, giving panels a distinctive hard-edge elevation. Redraws automatically on resize and theme change.

**This component is the app's only elevation mechanism.** Verified against the capture: no popover, panel, modal or card in the live UI carries a CSS `box-shadow`. The single exception in the whole app is the theme-toggle knob in the gear popover, which uses Tailwind `shadow-sm`. Anything that needs depth wraps in `DropShadow`; nothing applies `shadow-*` utilities. See `docs/adr/adr-009-replica-fidelity.md`.

Measured live geometry (`detail-popover-hatched-shadow-4x.png`, `exact-tokens.md` 3.6): a sibling `<canvas class="absolute top-0 left-0 pointer-events-none">` sized `panel + 4px`, inside a wrapper carrying `padding-right: 6px; padding-bottom: 6px`. The hatch is drawn on the right and bottom edges only, offset **6px right and 6px down**, and follows the panel's 8px corner radius around the corner. Confirmed users of this treatment: the gear popover, the agent context-switcher popover, the row kebab menu, and the Edit Prompt modal.

## Props

```ts
withDefaults(defineProps<{
  offsetX?: number;                        // shadow offset right, px; default 6 (measured)
  offsetY?: number;                        // shadow offset down, px; default 6 (measured)
  intensity?: number;                      // 0-1 alpha / pattern density; default 0.5
  pattern?: "diagonal" | "crosshatch" | "dots";  // default "diagonal" (measured)
  elevation?: "none" | "sm" | "md" | "lg"; // optional preset; overrides offset/intensity when set
}>(), { offsetX: 6, offsetY: 6, intensity: 0.5, pattern: "diagonal" });
```

## Emits

None.

## Slots

- default - the elevated content (first element child's border radius is sampled for the silhouette)

## Behavior

- The wrapper reserves `offsetX`/`offsetY` as right/bottom padding (`padding-right: 6px; padding-bottom: 6px` at the defaults) and positions an absolutely-placed canvas behind the content, sized to the content box **plus 4px** in each axis so the offset hatch is not clipped.
- On mount and on every relevant change it measures the content box, samples the first child's computed `border-radius`, and draws the chosen pattern clipped to that rounded-rect path translated by the offsets.
- A `ResizeObserver` on the content and a `MutationObserver` on the root `.dark` class trigger redraws, as do prop changes; both observers disconnect on unmount.
- Pattern rendering is pure canvas 2D: `diagonal` (the live default) strokes one direction; `crosshatch` strokes both; `dots` uses a deterministic 4x4 threshold matrix scaled by `intensity`. Stroke/fill color follows the shadow color token (dark-mode aware).
- The drawn region is the offset silhouette **minus** the content silhouette, so the hatch appears only on the right and bottom edges and wraps the rounded corner - it never shows through a translucent panel.
- Popovers have no CSS enter/leave transition; the hatch is painted once at open time. Do not animate it in.
- The canvas is `pointer-events: none`; it never interferes with interaction.

## States

- **Loading**: n/a (draws synchronously after mount).
- **Empty**: no slotted content; canvas draws nothing.
- **Error**: missing 2D context (very old browsers); component degrades to no shadow.
- **Disabled**: `elevation="none"` skips drawing entirely.

## Theming / Swappability

Shadow ink is token-driven: `--dropshadow-color` (default black light / `#6b7280` dark) and `--dropshadow-color-dark`, plus `--dropshadow-line-width`. The `elevation` presets map to theme tokens `--elevation-sm/md/lg`, each a `{offsetX, offsetY, intensity}` triple, so a theme can dial elevation globally or switch the default pattern via `--dropshadow-pattern` without touching logic. A theme that wants conventional blurred elevation redefines those tokens and swaps the pattern; because nothing else in the app draws depth, that one change re-elevates the entire UI. Canvas DPI scaling follows `devicePixelRatio` automatically for crisp lines on retina displays.

## API Endpoints

None. Pure presentational component.
