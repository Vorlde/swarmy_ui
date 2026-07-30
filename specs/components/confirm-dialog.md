# Component Spec: ConfirmDialog

## Purpose

Small confirmation dialog for destructive or irreversible actions (delete, discard changes, revoke). Used standalone and embedded by `Modal` and `DataTable`.

## Props

```ts
withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;        // default "Confirm Action"
  message?: string;      // default "Are you sure you want to continue? You will lose any unsaved changes."
  confirmText?: string;  // default "Continue"
  cancelText?: string;   // default "Cancel"
  danger?: boolean;      // renders confirm button with danger variant
}>(), { ... });
```

## Emits

- `update:modelValue(value: boolean)`
- `confirm()` - confirm clicked; dialog closes itself after emitting
- `cancel()` - cancel clicked or dialog dismissed

## Slots

- default - replaces `message` with rich content (e.g. a list of items to be deleted)

## Behavior

- `Escape` and backdrop click emit `cancel`.
- Focus is trapped while open; initial focus lands on the cancel button for safety.
- Confirm uses `UiButton` (variant `danger` when `danger` prop is set, else `primary`).

## States

Closed, open, confirming (caller may pass `loading` state through a footer slot override if async work follows confirm).

## Theming / Swappability

Card surface `--color-background`, border `1px --color-border`, radius `--radius-lg`. Title `--color-text` semibold; message text uses the muted text token. The confirm button color is entirely controlled by `UiButton` variant tokens, so retheming danger actions is a token change in one place.

**Elevation is not a CSS shadow.** Replace any `shadow-lg` with the shared `DropShadow` wrapper (`components/drop-shadow.md`) using `offsetX: 6`, `offsetY: 6`, `pattern: "diagonal"` - a sibling `<canvas>` painting a diagonal hatch on the right and bottom edges, following the corner radius, inside a wrapper with `padding-right: 6px; padding-bottom: 6px`. In this app `shadow-sm` appears only on the theme-toggle knob.

The scrim follows `Modal`: a near-opaque **white** wash in light theme (inverting to near-opaque black in dark), exposed as the `--modal-scrim` token pair - not a translucent black overlay.
