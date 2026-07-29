# DependencyTree

Project: **swarmy_ui**. Tree of an agent's dependency closure shown in PackModal.

## Purpose

Renders the pack analyze response: the root agent with its prompts, tools, models, and hooks nested recursively (subagents expand their own dependencies). Each private dependency gets an ExtractCopyToggle; shared dependencies are marked read-only.

## Props

```ts
interface DependencyItem {
  id: string;
  kind: 'agent' | 'prompt' | 'tool' | 'model' | 'hook';
  name: string;
  shared: boolean;
  children?: DependencyItem[];
}

interface Props {
  items: DependencyItem[];
  decisions: Record<string, 'extract' | 'copy'>;  // v-model, keyed by item id
  loading?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `update:decisions` | `Record<string, 'extract' \| 'copy'>` | a toggle changes |

## Slots

| Slot | Purpose |
|---|---|
| `row` | full row override (`{ item, decision, setDecision }`) |

## API calls

None (PackModal feeds it the analyze response).

## Visual behavior

Recursive indented rows: kind icon + name + shared chip + ExtractCopyToggle for private items. Shared items show a `shared` chip and no toggle. Subagent branches are collapsible, expanded by default.

## States

- **Loading**: skeleton rows when `loading` is true.
- **Empty**: single root-only closure renders a note row under the root.
- **Error**: none (parent handles analyze errors).

## Theming

Row icons per kind, indent, and chips are token-driven. Toggle appearance comes from ExtractCopyToggle's own tokens; the `row` slot supports full redesign without changing the decisions contract.
