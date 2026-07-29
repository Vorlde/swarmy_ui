# HookNode

Project: **swarmy_ui**. Compact card for a lifecycle hook attached to an agent.

## Purpose

Displays the hook event name with a bolt icon. Hooks sit in a row directly beneath the agent root.

## Props

```ts
interface Props {
  data: { hook: string };
  selected?: boolean;
  hovered?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | - | card click |
| `edit-surface` | `EditTarget` (`{ entityType: 'hook', entityId: data.hook }`) | click or edit affordance |

## Slots

None.

## API calls

None (hook list is loaded in the view catalog).

## Visual behavior

Single-line pill card: `[zap icon] on_message`. Smaller than other nodes (no subtitle). Same select ring and hover behavior as all nodes.

## States

- No loading state (inline data).
- **Empty**: not applicable; a hook always has a name.
- No error state.

## Theming

Chrome from `theme.node` with a smaller padding token (`--space-sm`). Icon and event-name typography are token-driven; a theme may restyle hooks as circular badges by changing radius/padding tokens only.
