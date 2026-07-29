# VariablesList

Project: **swarmy_ui**. Compact list of an entity's declared variables.

## Purpose

Renders `AgentVariable[]` as inline chips or rows: name, type, required marker, and optional description tooltip. Used on AgentNode, SidePromptNode, PromptCard, and in inspector forms.

## Props

```ts
interface Props {
  variables: AgentVariable[];
  variant?: 'chips' | 'rows';  // default 'chips'
  maxVisible?: number;          // chips variant collapses overflow into "+N"
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | `variable: AgentVariable` | chip/row clicked (opens the variables section of the edit surface) |

## Slots

| Slot | Purpose |
|---|---|
| `chip` | custom variable chip rendering (`{ variable }`) |
| `empty` | custom empty-state content |

## API calls

None.

## Visual behavior

Chips variant: `name*` (asterisk for required) with the type in muted text, wrapped inline; overflow collapses to a `+N more` chip that expands on click. Rows variant: one row per variable `name : type  (required)` with description below in muted text. Each chip has a tooltip with type and description.

## States

- **Empty**: renders nothing by default (or the `empty` slot when provided).
- No loading/error states.

## Theming

Chip background, border, required-marker color (warning hue), type text color, and overflow chip style are tokens. Rows vs chips is a variant prop, but a theme can also swap default rendering via the `chip` slot without touching callers.
