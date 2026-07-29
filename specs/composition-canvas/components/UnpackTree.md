# UnpackTree

Project: **swarmy_ui**. Tree of package contents shown in UnpackModal.

## Purpose

Renders the analyze response for a package: agents at top level with their prompts, tools, models, and hooks nested. Each row carries a status (`new` or `shared`) and, for shared items, a skip/overwrite toggle.

## Props

```ts
interface UnpackItem {
  id: string;
  kind: 'agent' | 'prompt' | 'tool' | 'model' | 'hook';
  name: string;
  shared: boolean;          // already exists in the workspace
  children?: UnpackItem[];
}

interface Props {
  items: UnpackItem[];
  decisions: Record<string, 'skip' | 'overwrite'>;  // v-model, keyed by item id
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `update:decisions` | `Record<string, 'skip' \| 'overwrite'>` | a row toggle changes |

## Slots

| Slot | Purpose |
|---|---|
| `row` | full row override (`{ item, decision, setDecision }`) |

## API calls

None (UnpackModal feeds it the analyze response).

## Visual behavior

Indented rows with kind icon, name, and status chip. Shared rows show a two-option toggle (`skip` default, `overwrite`). New items show a `new` chip and no toggle. All rows expanded by default.

## States

- **Empty**: empty `items` renders "Package is empty".
- No loading state (parent handles it); no error state.

## Theming

Status chips use semantic tokens (`chip.new` = success hue, `chip.shared` = neutral/warning hue). Icons, indent, and toggle style are tokens; the `row` slot allows a fully custom row design.
