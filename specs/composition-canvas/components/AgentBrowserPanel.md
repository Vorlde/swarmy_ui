# AgentBrowserPanel

Project: **swarmy_ui**. Left sidebar listing all agents with search.

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
