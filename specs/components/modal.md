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

- Backdrop click and `Escape` close the modal.
- If `hasChanges` is true, closing first opens an internal `ConfirmDialog` ("You have unsaved changes"); confirming closes, canceling keeps the modal open.
- Keydown listener is attached only while open and removed on unmount.
- Body scroll is locked while open.
- Layout adapts via a `500px` container query: below it, the card goes full-width and the footer stacks (classes `modal-card`, `modal-card-footer`).

## States

Closed, open, open-with-unsaved-confirm, busy (callers render a loading `UiButton` in the footer slot).

## Theming / Swappability

Backdrop: `bg-black/50` token pair (`dark:bg-black/80`). Card surface `--color-background-soft`, border `--color-border`, radius `--radius-xl`, shadow `shadow-xl`. Header title uses `--color-text` at semibold weight. Width/min-height are passed as utility-class props so callers can restyle per use without touching the component. All visual values resolve through tokens; a theme swap changes every modal in the app at once.

## Wireframe

```
+------------------------------------------------------------------------+
| (backdrop: dimmed page content, click or Escape closes)                |
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
