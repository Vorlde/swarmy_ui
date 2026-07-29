# FunctionToolCard

Project: **swarmy_ui**. Card for executable tools: function, provider, and MCP tools.

## Purpose

Displays tool name, kind label, description, and input/output schema arity. Optionally expands to show the JSON schema via DataTreeView.

## Props

```ts
interface Props {
  detail: ToolDetail;
  kind: 'tool' | 'provider' | 'mcp';
  expandable?: boolean;     // default true
  selected?: boolean;
  hovered?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `edit` | `defaultToolTab?: 'input' \| 'output' \| 'config'` | edit button or schema row click |
| `toggle-expand` | `expanded: boolean` | expand chevron |

## Slots

| Slot | Purpose |
|---|---|
| `icon` | override the kind icon |
| `schema` | override the expanded schema rendering (default DataTreeView) |

## API calls

None directly (ToolNode loads `ToolDetail` and passes it in).

## Visual behavior

Header: `[fx]` icon + name; subtitle kind label (`function tool` / `provider tool` / `mcp tool`). Stat line `in: N - out: M` derived from schema property counts. Expand chevron reveals input and output schemas rendered as DataTreeView. Description truncated to two lines with a tooltip.

## States

- **Loading**: handled by ToolNode wrapper (shimmer).
- **Empty**: no schemas shows `in: 0 - out: 0` and disables the expand chevron; no description omits the line.
- **Error**: schema parse failure shows an inline "schema unavailable" note.

## Theming

Kind icon color per kind comes from a `toolKindColors` theme map. Expand animation duration, schema tree indent, and mono font for schema keys are tokens. The `schema` slot lets a theme replace the tree rendering entirely (e.g. raw JSON block).
