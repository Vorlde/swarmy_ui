# Direction D - Tiled Workspace

Ambition: a different application architecture, not a restyle. There are no
fixed views. The app is a tiling workspace where any entity can open in any
pane, the entire layout is URL state, and all data flows through a
normalized client cache fed by one multiplexed event bus. Reference points:
tmux/i3 splits, Linear's peek-and-split, Bloomberg-terminal composability,
VS Code's editor groups.

## Thesis

Every other direction still hardcodes an opinion about which surfaces sit
next to which. Real workflows disagree with any fixed opinion: debugging
wants thread + agent canvas + prompt side by side; an admin wants users +
API keys; a prompt engineer wants two prompt versions and a live run. The
current spec's swappability mandate says layout should be composition, not
logic. Direction D takes that mandate to its logical end: layout becomes
user-composed at runtime, and the "app" reduces to (1) a pane manager,
(2) a registry of pane types, and (3) a data layer.

## The model

Three concepts, no exceptions:

1. **Pane** - a rectangle rendering one pane type + params:
   `thread:th_1`, `canvas:ag_9`, `prompt-editor:pr_3`, `table:models`,
   `dashboard:fleet`, `timeline:th_1`. Every current view spec becomes a
   pane type; view specs are reused, their route shells are deleted.
2. **Workspace** - a saved split-tree of panes with sizes and tab stacks
   per leaf (VS Code editor-group model: panes can hold tab stacks).
   Serialized into the URL and to the server per user:
   `/w/(canvas:ag_9|60)/(thread:th_1,timeline:th_1|40h)`
   Named workspaces: "Build", "Ops", "Admin" ship as presets, so a new
   user sees a familiar app, not an empty grid.
3. **Link channels.** Panes can be linked (colored channel a la trading
   terminals): selecting a thread in a list pane retargets linked
   thread/timeline panes; selecting a canvas node retargets a linked
   editor pane. This replaces most explicit navigation.

```
+------------------------------------------------------------------------+
| [=] swarmy_ui   workspace: Debugging v      [Cmd+K]      [save layout] |
+--------------------------+---------------------------------------------+
| canvas:fraud_review   [1]| thread:3f9a1c                     o RUN [1] |
|                          |  side_a: Checking transaction history...    |
|   (sideA)--(agent)       |  tool lookup_account -> {...}               |
|       \      |           |  side_b: Based on the flag score...         |
|        \  (tool*)        +---------------------------------------------+
|         (sideB)          | prompt-editor:extraction_sys            [1] |
|                          |  +---------------------------------------+  |
| * linked selection       |  | monaco: You are a fraud analyst...    |  |
|   channel 1              |  +---------------------------------------+  |
|                          |                    [discard] [save v4]      |
+--------------------------+---------------------------------------------+
```

Clicking the tool node in the canvas pane (channel 1) retargets the editor
pane to that tool's schema; the thread pane highlights the frames that
tool produced. Three specs, zero navigation, one shared selection.

## Data architecture (the part worth stealing even if the UI is not chosen)

- **Normalized entity cache.** One client-side store of entities by
  `(type, id)` with typed edges (agent->prompts, thread->agent). Panes
  subscribe to selectors, never fetch. All REST responses and WS frames
  upsert into the same cache; two panes showing the same thread are
  physically incapable of disagreeing.
- **One socket, an event bus.** A single multiplexed connection
  (`/api/users/me/hub` + `/api/events` consolidated client-side; per-thread
  streams opened on demand and fanned out internally). Subscription
  refcounting per pane; reconnect logic exists once.
- **Command layer.** Every mutation is a named command
  (`thread.stop`, `prompt.save`, `agent.attachModel`) with optimistic
  apply + rollback. The palette, context menus, keyboard map, and pane
  toolbars are four skins over one command registry - which is also what
  makes the UI automatable and testable for free.

## What is kept

- Every view spec survives as a pane type's content spec (tables, canvas,
  inspector, marketplace). Tokens, typed client, auth, Zod boundaries
  unchanged. The swappability mandate is not just kept; this is its
  fullest expression (layout literally is user data).

## What is replaced

- The router-as-IA (routes reduce to `/login` and `/w/:layout`).
- Per-view stores -> entity cache + command layer.
- Modals and fixed panels -> panes; ConfirmDialog remains.

## New infrastructure required

- Split-tree pane manager with drag-to-split/dock/tab (the hard, fun 20%;
  ~2-3k lines owned code or `dockview` as a dependency - ADR required).
- Layout serializer (URL + server persistence + presets).
- Entity cache, event bus, command registry (each modest alone; together
  they are a real data platform and the bulk of the effort).

## Risks

- High. Infinite flexibility can mean nobody arranges anything: presets
  and link-channel defaults must make the blank-slate problem invisible.
- Pane-count performance discipline needed (N live panes = N subscriptions;
  refcounting and virtualization are load-bearing).
- Longest time-to-first-usable-screen of all four directions; the pane
  manager must exist before any feature feels real.
- Mobile story is "read-only single pane"; acceptable for an admin tool,
  but it must be an explicit decision.

## Migration path

D is not all-or-nothing. The recommended consumption of this proposal:

1. Adopt its data layer (entity cache, event bus, command registry) under
   direction A or B - none of it depends on tiling.
2. Ship the pane manager later as the power-user layer: direction B's
   Studio docks are structurally a fixed pane layout, so Studio can grow
   into D ("unlock layout" button) without a rewrite.

## Choose this when

The product is heading toward being the daily terminal for agent
operators and builders, the desktop is the only target that matters, and
you are willing to invest in platform infrastructure before surface
features. Highest ceiling for power users, highest risk of over-building
for everyone else.
