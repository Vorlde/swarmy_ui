# AgentLockupCard

Project: **swarmy_ui**. Card for agent-referencing tools: subagents and handoffs.

## Purpose

Shows the referenced agent's name, kind (`subagent` or `handoff`), and target agent name. For packed agents it shows a packed badge sourced from packed-info.

## Props

```ts
interface Props {
  name: string;
  kind: 'subagent' | 'handoff';
  targetAgent?: string;
  packed?: boolean;
  selected?: boolean;
  hovered?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `edit` | - | edit button |
| `view-agent` | `name: string` | target agent link clicked (canvas navigates to that agent) |

## Slots

| Slot | Purpose |
|---|---|
| `badge` | override the packed badge rendering |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/pack/{packageId}/packed-info` | only when `packed` is true and badge detail is expanded |

## Visual behavior

Header: arrow icon + display name; subtitle is the kind label; body line `target: <targetAgent>` (clickable, emits `view-agent`). Subagent cards use the `theme.edge.colors.subagent` accent; handoff uses the neutral accent. Packed badge in the header corner when `packed`.

## States

- **Loading**: packed badge detail shimmer while packed-info loads.
- **Empty**: missing `targetAgent` shows muted "unresolved target".
- **Error**: packed-info failure hides the badge detail, keeps the badge.

## Theming

Accent color by kind is theme-driven (`edge.colors.subagent` vs `edge.colors.default`). Badge shape, icon, and the target-link styling are all token-driven; a theme can make the whole card look like a compact chip row.
