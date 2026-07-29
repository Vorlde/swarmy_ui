# DataTreeView

Project: **swarmy_ui**. Generic expandable tree for JSON-like data (schemas, config objects).

## Purpose

Renders arbitrary JSON (objects, arrays, primitives) as an indented, collapsible key/value tree. Used by FunctionToolCard schema expansion, InspectorPanel schema sections, and modal detail views.

## Props

```ts
interface Props {
  data: unknown;
  rootLabel?: string;
  defaultExpandedDepth?: number; // default 1
  maxHeight?: string;            // scroll container cap
}
```

## Emitted events

None (pure display).

## Slots

| Slot | Purpose |
|---|---|
| `value` | custom rendering for primitive values (`{ value, key, path }`) |

## API calls

None.

## Visual behavior

Objects/arrays render as collapsible rows with item counts (`{3}` / `[2]`); primitives render `key: value` with value type coloring (string, number, boolean, null). Long strings truncate with click-to-expand. Mono font throughout.

## States

- **Empty**: `null`/`undefined` root renders a muted "no data" line.
- No loading state; no error state (malformed input falls back to `String(data)`).

## Theming

Type colors (string/number/boolean/null) come from a `dataTree.valueColors` theme map; indent guides, chevrons, and mono font stack are tokens. The `value` slot allows full per-type restyling.
