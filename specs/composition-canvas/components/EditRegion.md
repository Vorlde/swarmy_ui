# EditRegion

Project: **swarmy_ui**. Inline edit affordance wrapper used inside node cards and inspector sections.

## Purpose

Wraps a display value; on click (or when its `editTarget` matches the hovered edit target) it reveals an edit affordance and emits an intent to open the edit surface for that section.

## Props

```ts
interface Props {
  label: string;             // a11y label and tooltip, e.g. "Edit prompt body"
  editTarget: EditTarget;    // { entityType, entityId, section }
  highlighted?: boolean;     // true when parent hovers the matching target
  readonly?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `edit` | `EditTarget` | affordance clicked |
| `hover` | `EditTarget \| null` | mouseenter/mouseleave (drives cross-highlighting) |

## Slots

| Slot | Purpose |
|---|---|
| default | the display content being wrapped |
| `affordance` | override the edit icon/button |

## API calls

None.

## Visual behavior

On hover (or `highlighted`), a dashed outline in the accent color appears around the content plus a small pencil affordance top-right. Clicking emits `edit`. `readonly` renders content only, no affordance.

## States

- Default, hover, highlighted (cross-highlight from elsewhere in the UI), readonly.
- No loading/empty/error states.

## Theming

Outline style (dashed vs solid), outline color, affordance icon, and reveal transition are tokens. The `affordance` slot allows replacing the pencil with any theme-specific control.
