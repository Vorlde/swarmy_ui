# Component Spec: Modal

## Purpose

Reusable modal dialog shell used by every create/edit workflow. Handles backdrop, escape-to-close, unsaved-changes guarding, and a consistent header/footer layout.

## Props

```ts
withDefaults(defineProps<{
  modelValue: boolean;        // v-model: open state
  title?: string;
  width?: string;             // tailwind max-width class, default "max-w-lg"
  minHeight?: string;         // default "min-h-[24rem]"
  hasChanges?: boolean;       // enables unsaved-changes confirm on close
  contentPadding?: boolean;   // default true
}>(), { ... });
```

## Emits

- `update:modelValue(value: boolean)`
- `close()` - fired after any close path (backdrop, escape, X button, unsaved-confirm)

## Slots

- default - modal body content
- `footer` - action row (defaults to nothing; callers place `UiButton`s)

## Behavior

- The card is `position: fixed` and centered on both axes. Measured from `prompt-edit-modal-1512-light.png` / `-1920-light.png`: a fixed card width (`~1016px` for the wide `Edit Prompt` variant, i.e. a `max-w-5xl`/`1024px` wrapper minus the `6px` DropShadow gutter) and a height capped at `~85vh` (`~725px` at an `850px` viewport, `~2074px` at `2400px`).
- The card is wrapped in `DropShadow` (`offsetX: 6`, `offsetY: 6`, `pattern: "diagonal"`), so the wrapper reserves `padding-right: 6px; padding-bottom: 6px` and a sibling `<canvas>` paints the hatch. Never apply `box-shadow` / `shadow-xl`.
- The body between header and footer is the modal's own scroll container (`overflow-y: auto`, `overscroll-behavior: contain`); the header and any pinned sub-nav sit outside it so they stay visible while the body scrolls.
- Backdrop click and `Escape` close the modal.
- If `hasChanges` is true, closing first opens an internal `ConfirmDialog` ("You have unsaved changes"); confirming closes, canceling keeps the modal open.
- Keydown listener is attached only while open and removed on unmount.
- Body scroll is locked while open.
- Layout adapts via a `500px` container query: below it, the card goes full-width and the footer stacks (classes `modal-card`, `modal-card-footer`).

## States

Closed, open, open-with-unsaved-confirm, busy (callers render a loading `UiButton` in the footer slot).

## Theming / Swappability

Backdrop: **not** `bg-black/50`. The captured scrim is a near-opaque **white** wash in light theme - the `#f3f3f3` page reads `#fdfdfd` through it, i.e. roughly `--color-background` at ~`0.85` alpha - with the dark-theme pair inverting to a near-opaque black wash. Expose it as a `--modal-scrim` token pair rather than a hardcoded black overlay.

Card surface `--color-background` (`#ffffff` / `~#171717`), border `1px --color-border` (`#d4d4d4` / `#404040`), radius `--radius-lg` (`8px`), header bar `60px` with the title in `--color-text` at bold weight.

**Elevation is `DropShadow`, not `box-shadow`.** In this app `shadow-sm` appears only on the theme-toggle knob; every panel, popover, and modal gets depth from the shared `DropShadow` canvas (see `components/drop-shadow.md`) with `offsetX`/`offsetY` `6` and `pattern: "diagonal"`, tinted by `--dropshadow-color`. A flatter theme sets `elevation="none"`; it never swaps in a blur radius.

Width/min-height are passed as utility-class props so callers can restyle per use without touching the component. All visual values resolve through tokens; a theme swap changes every modal in the app at once.

## Wireframe

```
+------------------------------------------------------------------------+
| (scrim: near-opaque WHITE wash over the page in light theme,           |
|  inverted to near-opaque black in dark; click or Escape closes)        |
|                                                                        |
|          +--------------------------------------------------+          |
|          |  Modal title                                 [x] |  header  |
|          |--------------------------------------------------|          |
|          |                                                  |          |
|          |  (default slot: body content)                    |  body    |
|          |  contentPadding applies here                    |          |
|          |                                                  |          |
|          |--------------------------------------------------|          |
|          |                        [Cancel]  [Save (busy..)] |  footer  |
|          +--------------------------------------------------+          |
|                                                                        |
+------------------------------------------------------------------------+

Narrow (< 500px container query):              Unsaved-changes guard (hasChanges):
+----------------------------+                 +----------------------------------+
| Title                  [x] |                 | Discard unsaved changes?         |
|----------------------------|                 |                                  |
| (body, full-width)         |                 |      [Keep editing] [Discard]    |
|                            |                 +----------------------------------+
|----------------------------|
| [Cancel]                   |  footer stacks
| [Save]                     |
+----------------------------+
```

Body scroll is locked while open; the keydown listener exists only for the open lifetime.
