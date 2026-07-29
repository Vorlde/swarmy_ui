# Component Spec: JsonViewer

## Purpose

Renders arbitrary JSON as a syntax-highlighted, collapsible tree. Used in thread inspectors, logs, and tool I/O panels to make structured payloads readable. Supports expanding and collapsing object/array nodes and copying the dot path of any key.

## Props

```ts
defineProps<{
  json?: unknown;              // object, array, primitive, or a JSON string (auto-parsed)
  showCopyButton?: boolean;    // default false: show floating copy-payload button
  collapsedDepth?: number;     // default Infinity: depth at which nodes start collapsed
  maxStringLength?: number;    // default none: truncate long strings with an ellipsis
}>();
```

## Emits

- `copy-path(path: string)` - user clicked a node key to copy its path (e.g. `steps[2].output`)
- `toggle(path: string, expanded: boolean)` - a node was expanded or collapsed

## Slots

- default - not used; content is derived from `json`
- `empty` - rendered when `json` is null/undefined (defaults to a muted `null` literal)

## Behavior

- If `json` is a string, it is parsed once; on parse failure the raw string is rendered as escaped text.
- Objects and arrays render with a fold marker; clicking it toggles that subtree. Nodes at or below `collapsedDepth` start collapsed with a child-count badge (`{3}` / `[12]`).
- Clicking a key copies its full dot/bracket path and emits `copy-path`.
- When `showCopyButton` is set, a floating `CopyButton` (ghost, xs) is pinned top-right and copies the pretty-printed payload.
- All output is HTML-escaped before injection; the viewer never executes or evaluates payload content.

## States

- **Empty**: `json` is null/undefined; shows the `empty` slot.
- **Invalid**: unparseable string input; rendered verbatim as plain text.
- **Loading**: none (pure derived render; callers gate on their own loading state).
- **Disabled**: n/a.

## Theming / Swappability

Every token type maps to a scoped class (`json-key`, `json-string`, `json-number`, `json-boolean`, `json-null`, `json-punct`, `json-fold-marker`) whose colors resolve through theme tokens: keys use `var(--accent-600)` light / `var(--accent-400)` dark, strings use the neutral-500 scale, numbers the blue scale, booleans the amber scale. The container surface is `--color-background` with `--font-mono` at `text-xs`. Fold markers use `--color-border` and accent on hover. A theme swap by redefining the accent/neutral token set recolors the entire tree with zero logic changes; density (font size, indent width) is set on CSS custom properties `--json-indent` and `--json-font-size`.

## API Endpoints

None. Pure presentational component.
