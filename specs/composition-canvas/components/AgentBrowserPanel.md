# AgentBrowserPanel

Project: **swarmy_ui**. Agent list that drives canvas selection.

> **Placement correction.** This is not a left sidebar next to the canvas. In the live app the agent
> list is cascade **snap section 1**, a full-width CSS **grid**
> (`grid-cols-[36px_1fr_72px_80px_1fr_32px]`, `gap-x-4`) - not a `<table>` and not a narrow panel -
> with a header bar, search box, `All` segmented filter, and a `New Agent` button. Per-row overflow
> actions live in a kebab (`...`) menu with `Edit / Pack / Delete`. The canonical spec for that surface
> is under `specs/views/`; this file covers only the selection contract the canvas depends on.

## Purpose

Searchable list of agents from the catalog. Drives which agent the canvas displays. Shows per-agent type badge and packed indicator.

## Props

```ts
interface Props {
  agents: AgentSummary[];   // from GET /api/agents
  selectedId?: string | null;
  loading?: boolean;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `select` | `agentId: string` | list row clicked |
| `create` | - | "new agent" button clicked |

## Slots

| Slot | Purpose |
|---|---|
| `row-actions` | per-row overflow actions (pack, duplicate, delete) |
| `footer` | panel footer (e.g. view toggle Structure/Canvas) |

## API calls

None directly (CompositionView owns the catalog fetch).

## Visual behavior

Search input at top filters by name/title client-side (case-insensitive substring). Rows: name, type badge (`dual_ai`/`ai_human`), packed badge. Selected row highlighted. List is virtualized when agents exceed 100.

## States

- **Loading**: skeleton rows (5 placeholders).
- **Empty**: no agents - "No agents yet" plus create button; no search matches - "No matches for '<q>'".
- **Error**: none (parent shows the error region).

## Theming

Row chrome, badges, and search input use shared tokens (`--color-surface`, `--color-border`, accent for selection). Badge palette and row density are theme tokens; a compact mode only changes density tokens.
