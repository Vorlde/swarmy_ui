# StructureTreeRow

Project: **swarmy_ui**. Single row inside StructureTree (recursive).

## Purpose

Renders one tree entry: expand chevron (if children), type icon, label, and type badge. Recursively renders its children.

## Props

```ts
interface Props {
  nodeId: string;
  label: string;
  nodeType: NodeType | 'prompt' | 'group';
  depth: number;
  children?: StructureTreeRowModel[];
  selected?: boolean;
  expanded?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | `nodeId: string` | row body clicked |
| `toggle` | `expanded: boolean` | chevron clicked |

## Slots

| Slot | Purpose |
|---|---|
| `icon` | custom leading icon |

## API calls

None.

## Visual behavior

Row padding-left = `depth * indent`. Selected row gets accent-tinted background and left indicator bar. Hover shows a faint background. Chevron rotates 90 degrees when expanded.

## States

- No loading/empty/error states; leaf rows render no chevron.

## Theming

Selected background, indicator bar color, row height, chevron rotation transition, and indent step are theme tokens. A theme can switch to a file-manager look (bigger rows, folder icons) without logic changes.
