# StructureTree

Project: **swarmy_ui**. The left half of the Structure pane - shown **beside** the canvas at all times, not an alternative view toggled against it.

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

Root element `.structure-tree`, body `text-[12px]`, `border-r border-neutral-200`. Width is user-resizable
via the sibling `.structure-tree-resizer` (`w-[5px] cursor-col-resize -mx-[2px]`, hairline
`w-px group-hover:bg-accent-500/60`) and persisted as
`localStorage['composition.structureTreeWidth']` (default `"320"`).

Builds a tree by walking edges from the root agent node. Renders recursive StructureTreeRow children.
Rows are `chevron / type icon / label` with a right-aligned muted value or count (`None`, `6`,
`deepseek/dee...`); some rows carry a trailing edit-icon button. Beyond the canvas node kinds the tree
also shows structural rows that are **not** canvas nodes - `Variables`, `Side Config`, `Prompt Config`,
`Input schema`, `Tools`, `Functions`, `Sub-prompts`, `Handoffs`, `Sub-agents`. Auto-scrolls the selected
row into view. Expand/collapse per branch; expanded state persists per node id in local storage.

The pane shares one header with the canvas: `[icon] Structure  <agent name>` (bold "Structure", machine
name in muted regular weight). There is no separate tree header and no Structure/Canvas toggle.

## States

- **Empty**: no layout shows "Nothing to display".
- No loading state (data is derived); no error state.

## Theming

Indent width, connector line style (solid/dotted/none), row height, and type-icon set are theme tokens. Connector lines and guide colors use `--color-border`.
