# StructureTreeRow

Project: **swarmy_ui**. Single row inside StructureTree (recursive).

## Purpose

Renders one tree entry: expand chevron (if children), type icon, label, and type badge. Recursively renders its children.

## Props

```ts
interface Props {
  nodeId: string;
  label: string;
  /** Canvas node kinds plus tree-only structural rows (Variables, Side Config, Prompt Config,
   *  Input schema, Tools, Functions, Sub-prompts, Handoffs, Sub-agents). */
  nodeType: NodeKind | 'group' | 'section';
  /** Right-aligned muted value or count, e.g. "None", 6, "deepseek/dee...". */
  trailing?: string | number;
  /** Renders a trailing edit-icon button (present on prompt and sub-prompt rows). */
  editable?: boolean;
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

Row padding-left = `depth * indent`, body `text-[12px]`. Selected row gets the accent surface
`#efe3ff` light / `#302043` dark; hover is `#f8f2ff` / `#1c1525`. Chevron rotates 90 degrees when
expanded. Leaf `> name` rows (individual functions) render their label in mono. The trailing value or
count sits right-aligned in muted text.

## States

- No loading/empty/error states; leaf rows render no chevron.

## Theming

Selected background, indicator bar color, row height, chevron rotation transition, and indent step are theme tokens. A theme can switch to a file-manager look (bigger rows, folder icons) without logic changes.
