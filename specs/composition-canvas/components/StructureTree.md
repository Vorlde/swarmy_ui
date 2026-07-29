# StructureTree

Project: **swarmy_ui**. Alternative hierarchical view of the composition (tree instead of graph).

## Purpose

Renders the same composition as an indented tree: agent at root, sides beneath, prompts/models/tools/hooks nested, subagents recursive. Selecting a row selects the same node id on the canvas.

## Props

```ts
interface Props {
  layout: CompositionLayout;
  selectedNodeId?: string | null;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | `nodeId: string` | row clicked (parent syncs canvas selection and focuses the node) |

## Slots

| Slot | Purpose |
|---|---|
| `row-icon` | override per-type row icons |

## API calls

None (derives the tree from the layout's nodes/edges).

## Visual behavior

Builds a tree by walking edges from the root agent node. Renders recursive StructureTreeRow children. Auto-scrolls the selected row into view. Expand/collapse per branch; expanded state persists per node id in local storage.

## States

- **Empty**: no layout shows "Nothing to display".
- No loading state (data is derived); no error state.

## Theming

Indent width, connector line style (solid/dotted/none), row height, and type-icon set are theme tokens. Connector lines and guide colors use `--color-border`.
