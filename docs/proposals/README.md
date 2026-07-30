# swarmy_ui - Frontend Direction Proposals

Date: 2026-07-30
Branch: `ui/frontend-directions`
Status: proposal, nothing here is implemented

## Why this document exists

The current spec package (main branch) describes a solid, conventional admin
app: sidebar shell, table views, a composition canvas view, a tabbed thread
inspector, and a modal stack for editing. It is good. This package asks a
different question: if UX smoothness is the #1 principle, what are the
strongest shapes this product could take, including shapes that are not an
admin panel at all?

Four directions are proposed. They are intentionally different in ambition,
from "keep everything, make it feel world-class" to "this is a different kind
of application". Each direction has its own doc with layout wireframes,
interaction model, architecture impact, and risk assessment.

| # | Direction | One-liner | Ambition | Risk |
|---|-----------|-----------|----------|------|
| A | [Refined Console](./direction-a-refined-console.md) | Keep the current IA, rebuild the interaction layer: command palette, URL-addressable panels instead of modals, keyboard-first, optimistic server cache | Evolution | Low |
| B | [Studio](./direction-b-studio.md) | Canvas-first workspace (Figma/Blender model): the agent graph is the app, everything else docks around it, run and observe without leaving the canvas | Rebuild of shell + IA | Medium |
| C | [Mission Control](./direction-c-mission-control.md) | Operations-first: live fleet dashboard as home, thread inspector rebuilt as a trace timeline (observability-tool grade), build surfaces secondary | Rebuild of IA + inspector | Medium |
| D | [Tiled Workspace](./direction-d-tiled-workspace.md) | Different architecture: no fixed views at all, a tiling pane system where any entity opens in any pane, full URL state, one multiplexed event bus, normalized client cache | New architecture | High |

## The UX thesis shared by all four

Whatever direction is picked, these principles are non-negotiable and are
folded into every proposal:

1. **Zero dead ends.** Every entity name shown anywhere (agent, model, prompt,
   tool, thread id) is a live affordance: hover preview, click to open, never
   a plain string.
2. **The URL is the state.** Anything the user can look at can be linked,
   refreshed, and restored: selected node, open panel, active tab, filters.
   Modals that hold real work are an anti-pattern; they cannot be shared or
   restored.
3. **Never block on the network.** Optimistic writes with rollback, cached
   reads with background revalidation, skeletons only on true cold loads.
4. **Keyboard is a first-class citizen.** A command palette (Cmd+K) that can
   navigate, create, and act; consistent list navigation (j/k, arrows, enter);
   escape always closes the topmost surface.
5. **Live by default.** The product runs agents in real time; the UI should
   never show stale rows where a WebSocket already knows better.
6. **Pixel discipline.** One spacing scale, one radius scale, one motion
   spec. The existing token system (ADR-001) already enables this; the
   directions differ in layout, not in token philosophy.

## What stays constant in all directions

- The API contract and typed client (132 endpoints + WS helpers) are reused
  as-is in every direction.
- The token-first theming system and the swappability mandate survive in all
  four; direction D is in fact the strongest expression of it.
- Vue 3 + Vite + Tailwind v4 remain the stack. A framework swap was
  considered and rejected: nothing in any direction needs capabilities Vue
  lacks, and the spec package, skills, and client are already Vue-shaped.
  (See "Rejected: framework migration" below.)

## Comparison

| Dimension | A: Refined Console | B: Studio | C: Mission Control | D: Tiled Workspace |
|---|---|---|---|---|
| Primary user | Builder + admin equally | Builder | Operator | Power user |
| Home surface | Agents table | Canvas workspace | Live ops dashboard | Last workspace layout |
| Composition canvas | One view among 15 | The centerpiece | Secondary surface | A pane type |
| Thread inspection | Tabbed inspector, polished | Docked run console | Trace timeline, the centerpiece | A pane type |
| Modal usage | Only confirmations | Only confirmations | Only confirmations | None |
| Reuses current view specs | ~90% | ~55% | ~60% | ~40% |
| New infrastructure | Query cache, palette, panel router | Dock manager, palette | Timeline engine, analytics queries | Tile manager, normalized cache, event bus |
| Estimated relative effort | 1.0x | 1.8x | 1.7x | 2.6x |
| Risk of shipping something worse than current spec | Very low | Low-medium | Medium | Medium-high |

## Recommendation

**Ship A as the foundation, evolve toward B.** Concretely:

1. Build direction A now. It replaces the weakest parts of the current spec
   (modal stack for real editing, hand-rolled fetch-on-mount stores, no
   keyboard layer) while keeping every view spec valid. It is the best
   UX-per-week option and nothing in it is throwaway.
2. Direction A deliberately introduces the three pieces B needs anyway: the
   command palette, the URL-addressable panel system, and the server cache.
   When the canvas matures, promoting it from "a view" to "the workspace"
   (direction B) becomes a shell-level change, which the swappability
   mandate explicitly optimizes for.
3. Adopt C's trace timeline as the Messages/Logs unification inside the
   thread inspector regardless of direction; it is the single highest-value
   inspector upgrade and is direction-agnostic.
4. Keep D as the reference architecture for the cache and event bus design
   (its data layer is right even if its tiling UI is not for everyone).

## Rejected: framework migration (React/Solid/Svelte)

A full rebuild invites the question. Rejected because: the API client,
specs, PRDs, and installed skills are Vue-first; Vue 3 fine-grained
reactivity is a genuinely good fit for high-frequency WS streaming updates;
and no proposed direction is blocked by the framework. A migration would
burn the entire effort budget on parity instead of UX.

## Pipeline improvements (apply regardless of direction)

Independent of the chosen direction, these upgrades to the current spec
pipeline are recommended; each is detailed in the direction docs where it
first appears:

- Replace fetch-on-mount store methods with a query cache layer
  (stale-while-revalidate, request dedup, optimistic mutations). Keep the
  hand-rolled reactive stores for UI state only (ADR-006 amendment).
- One multiplexed WebSocket with topic subscription instead of up to six
  parallel sockets per session (server already exposes `/api/events` and
  `/api/users/me/hub`; consolidate client-side).
- A `specs/interaction/` addition to the spec package: keyboard map, focus
  rules, motion spec (durations/easings), and loading-state rules. The
  current specs define layout and data thoroughly but leave interaction
  quality implicit, which is where "smoothness" actually lives.
- Playwright E2E smoke flows added to `plans/build-order.md` phase gates,
  aligned with the user-flow diagrams (login, compose, run, inspect).
