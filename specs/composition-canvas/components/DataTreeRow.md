# DataTreeRow

Project: **swarmy_ui**. Single recursive row inside DataTreeView.

## Purpose

Renders one key/value pair. If the value is an object or array, renders a collapsible header row plus nested DataTreeRow children.

## Props

```ts
interface Props {
  keyName: string;
  value: unknown;
  depth: number;
  expanded?: boolean;
  path: string;  // dot path for the `value` slot
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `toggle` | `expanded: boolean` | collapsible header clicked |

## Slots

| Slot | Purpose |
|---|---|
| `value` | primitive value rendering override |

## API calls

None.

## Visual behavior

Indent = `depth * indentStep`. Collections show chevron + key + count badge; primitives show key + colored value. Hover highlights the row background subtly.

## States

No loading/empty/error states.

## Theming

Shares `dataTree` tokens with DataTreeView: indent step, value type colors, count badge style. All appearance is token-driven.
