# AgentLockupCard

Project: **swarmy_ui**. Card for an embedded sub-agent. Registered in the node-type registry under `kind: 'subagent'`.

## Purpose

Renders a `SubagentNode`: the referenced agent's identity, its type pill, session-turn limit,
description, and a summary column per inner side. Handoffs do **not** get a card in the reference - they
are listed in the PROMPT card's `HANDOFFS` rail - so the `handoff` kind is retained here only as an
unverified variant.

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

Flat white card, 1px `#171717` border (same weight as the AGENT root card), rounded, no shadow. Two bands:

**Header band**, split by a vertical hairline:
- Left: eyebrow `[icon] SUB-AGENT` in emerald plus a `rounded-full` emerald-outlined type pill
  (`DUAL AI`). Below: the agent avatar, display name in bold, machine name in muted mono, then a small
  neutral chip `max 8 session turns`, then the description in muted text.
- Right: a `(x) VARIABLES` column (`data-variables-section`), or the muted word `None`.

**Sides band**, one column per inner side separated by a vertical hairline: coloured eyebrow
(`WORKER` sky `#00a6f4`, `REVIEWER` amber `#fe9a00`), the prompt name in mono, then the label/value list
`Stop on response`, `Stop tool`, `Max steps`, `End conversation tool`. Values right-aligned and tinted
with the side accent when set; `Off` / `-` muted. The card is also the anchor of the `CanvasGroup` that
wraps the sub-agent's inner nodes.

## States

- **Loading**: packed badge detail shimmer while packed-info loads.
- **Empty**: no variables shows `None`; no description omits that line.
- **Error**: packed-info failure hides the badge detail, keeps the badge.

## Theming

The emerald eyebrow/pill accent is theme-driven; the card border comes from `theme.node.borderColor` and the side eyebrows from `theme.node.sideAccent`. `elevation` is `'none'` - no `box-shadow`. Badge shape, icon, and chip styling are all token-driven; a theme can make the whole card look like a compact chip row.
