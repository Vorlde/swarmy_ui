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

Flat white card, 1px `#d4d4d4` border, rounded, no shadow. Two bands separated by a full-width hairline:

1. *Header* - eyebrow `[TS badge] FUNCTION` (`text-[10px]` uppercase tracking-wider muted). Below it a
   **two-column** row: the tool name in bold mono on the left, the description as wrapped muted text on
   the right. Not a name-over-subtitle stack, and there is no `in: N - out: M` arity line.
2. *Args* - eyebrow `[icon] ARGS`, then one entry per input-schema property: a leading dot, the arg name
   in mono, a red `*` when required, and the type in a small neutral chip (`string`). The property
   description renders beneath in muted text.

The reference card is fully expanded with no chevron; keep `expandable` as an option but default the
args band to visible.

## States

- **Loading**: handled by ToolNode wrapper (shimmer).
- **Empty**: no input schema omits the ARGS band; no description leaves the right column empty.
- **Error**: schema parse failure shows an inline "schema unavailable" note.

## Theming

Kind icon color per kind comes from a `toolKindColors` theme map. Expand animation duration, schema tree indent, and mono font for schema keys are tokens. The `schema` slot lets a theme replace the tree rendering entirely (e.g. raw JSON block).
