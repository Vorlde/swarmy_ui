# Direction A - Refined Console

Ambition: evolution. Keep the current information architecture and ~90% of
the view specs. Rebuild the interaction layer so the same app feels
world-class instead of merely correct.

## Thesis

The current spec is structurally fine but interactionally silent. It defines
what every view shows and which endpoint feeds it, but smoothness lives in
the parts the spec leaves implicit: what happens in the 300ms after a click,
where focus goes, what the keyboard can do, what the URL remembers, and how
often the user is forced through a modal. Direction A attacks exactly those
gaps and nothing else.

## The five changes

### 1. Panels replace modals (URL-addressable edit surfaces)

The current spec routes almost all editing through a modal stack
(AgentModal, ModelModal, PromptModal, PackModal, EditSurface overlays).
Modals that hold real work are the single biggest UX flaw in the spec:
they trap focus, cannot be shared or restored on refresh, and stack badly.

Replacement: a right-side **panel router**. Any entity opens as a slide-in
panel (480px, resizable) driven by a query param:

```
/prompts?panel=prompt:pr_123          edit prompt in panel over the list
/agents/ag_9?panel=model:mdl_4        model editor over the canvas
/threads/th_1?panel=raw:msg_77        raw message JSON over the inspector
```

- Panels are lazy route components, exactly like views. Deep-linkable,
  refresh-safe, back-button-safe.
- One panel at a time; opening a second replaces the first (breadcrumb to
  return). Unsaved changes prompt before replacement.
- Modals remain only for true interrupts: ConfirmDialog and nothing else.
- The existing modal specs translate 1:1 (same forms, same Zod schemas);
  only the host changes. `EditSurfaceHost` becomes `PanelHost`.

Wireframe (prompts list with edit panel open):

```
+--------+-----------------------------------+----------------------+
|        |  Prompts (24)        [+ New]      | Edit: extraction_sys |
| Side   |  [search..............]           | ------------------   |
| bar    |  name             version  used   | Name  [...........]  |
|        |  extraction_sys   v3   6 agents   | Model [gpt-4o    v]  |
|        |  triage_router    v1   2 agents   | Body                 |
|        |  summarizer       v7   1 agent    | +------------------+ |
|        |  ...                              | | monaco editor    | |
|        |                                   | +------------------+ |
|        |                                   |    [Cancel] [Save]   |
+--------+-----------------------------------+----------------------+
```

### 2. Command palette + keyboard layer

`Cmd+K` opens a palette with three result groups: navigate (views,
entities by fuzzy name), create (new agent/prompt/model/thread), and act
(stop thread, toggle theme, copy id). Backed by a client-side index kept
warm by the query cache (change 4), so results are instant.

Global keyboard map (added to the spec package as
`specs/interaction/keyboard.md`):

- `Cmd+K` palette, `Cmd+B` collapse sidebar, `?` shortcut overlay
- Lists/tables: arrows or `j/k` move a selection cursor, `Enter` opens,
  `e` opens the edit panel, `x` selects for bulk actions
- `Esc` closes the topmost surface, always in the same order:
  palette > panel > selection
- Canvas keeps its existing map (already specced in panzoom.md)

### 3. Live-first lists and hover previews

- Every entity reference anywhere becomes an `<EntityChip>`: hover shows a
  preview card (agent: graph thumbnail + thread count; model: provider +
  caps; thread: status + last message), click navigates, `Cmd+click`
  opens the panel. Kills every dead-end string in the app.
- ThreadsView rows update from the existing `/api/events` socket with a
  subtle 400ms highlight pulse on change (token-driven color).
- Tables get skeleton rows only on cold load; on revalidation the stale
  data stays visible (no spinner flicker, ever).

### 4. Query cache under the stores (pipeline change)

Replace fetch-on-mount store methods with a small query layer
(`@tanstack/vue-query` or an owned ~200-line equivalent, decided by ADR):

- Stale-while-revalidate reads keyed by endpoint+params; request dedup
  across components; window-refocus revalidation.
- Optimistic mutations with rollback for all CRUD (create/rename/delete
  feel instant; failures roll back with a toast).
- WS frames write into the same cache (a thread event patches the threads
  query), so REST and streaming views can never disagree.
- ADR-006 amendment: reactive stores keep only UI state (theme, panes,
  selection); server state moves to the cache. This deletes most store
  code rather than adding a framework.

### 5. Motion and polish spec

A written motion spec (`specs/interaction/motion.md`) with exactly three
durations (120ms micro, 200ms surface, 300ms shell) and two easings, all
as tokens. Panel slide, palette pop, row pulse, sidebar collapse all
reference it. Plus: focus-visible rings everywhere, `prefers-reduced-motion`
compliance, empty states with a primary action, and error states with a
retry affordance. All enforced as acceptance criteria per view.

## What is kept from the current spec

- All 15 routes and view layouts, the sidebar shell, the composition canvas
  spec (entire folder), DataTable/JsonViewer/UiCodeBlock primitives, the
  token system, the typed client, auth flow.

## What is dropped

- The modal-stack edit model (`EditSurfaceHost`, modal specs re-hosted as
  panels), per-store fetch methods, the notion of blocking loaders after
  first paint.

## Architecture impact

- New: `PanelHost` + panel route table, `CommandPalette`, `EntityChip` +
  preview cards, query cache layer, keyboard/motion/interaction specs.
- Amended: ADR-006 (stores = UI state only), routing doc (panel query
  params), threads store (WS patches cache).
- Everything else builds exactly as `plans/build-order.md` already orders it.

## Risks

- Low. Largest risk is panel-vs-canvas real estate on small screens;
  mitigation: panel becomes full-screen takeover below `lg` breakpoint.
- Query-cache-plus-WS double-write needs one owner (the cache) to avoid
  race bugs; covered by a dedicated data-flow spec update.

## Choose this when

You want the highest UX gain per week, no throwaway work, and a foundation
that direction B can later stand on.
