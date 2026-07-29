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

Card surface `--color-background-soft`, border `--color-border`, radius `--radius-xl`, shadow `shadow-lg`. Title `--color-text` semibold; message text uses the muted text token. The confirm button color is entirely controlled by `UiButton` variant tokens, so retheming danger actions is a token change in one place. Backdrop uses the shared translucent black token pair.
