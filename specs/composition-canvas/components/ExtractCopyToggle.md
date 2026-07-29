# ExtractCopyToggle

Project: **swarmy_ui**. Two-option segmented toggle used per dependency in PackModal.

## Purpose

Chooses how a private dependency is packaged: `extract` (pull the item into the package as its own file, referenced by name) or `copy` (inline a snapshot into the package).

## Props

```ts
interface Props {
  modelValue: 'extract' | 'copy';
  disabled?: boolean;
  size?: 'sm' | 'md';   // default 'sm'
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | `'extract' \| 'copy'` | option clicked |

## Slots

| Slot | Purpose |
|---|---|
| `option-label` | override labels (`{ value }`) - e.g. localized or verbose labels |

## API calls

None.

## Visual behavior

Segmented control with two options; the active option has a filled accent background, the inactive one is muted. Sliding indicator animates between options (120ms). A hover tooltip explains each option's packaging semantics.

## States

- **Disabled**: whole control at reduced opacity, no pointer events.
- No loading/empty/error states.

## Theming

Active fill, inactive text color, indicator animation, radius, and padding are tokens (`toggle.activeBackground`, `toggle.inactiveText`, ...). A theme can restyle it as two radio chips; the v-model contract is unchanged.
