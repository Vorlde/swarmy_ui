# ADR-007: The Swappability Principle (CORE DECISION)

- Status: Accepted
- Context: swarmy_ui's defining constraint: **any part of the UI layer - theme, colors, component appearance, layout, even the entire skin - must be replaceable without touching functionality.** Business logic, data flow, and behavior are stable; everything the user sees is a replaceable surface.

## Decision

Every architectural boundary in swarmy_ui is drawn so that appearance depends on stable abstractions, never the reverse. Concretely, five seams:

## Seam 1 - Tokens (theme swap)

All visual constants live in Tailwind v4 `@theme` CSS custom properties, in three layers: primitives -> semantic -> component. Components reference semantic utilities only. A new theme is a new CSS file. See ADR-001 and docs/design/theming.md.

## Seam 2 - The `Ui*` primitive layer (component skin swap)

All buttons, badges, tooltips, dropdowns, alerts, form wrappers, and empty states are implemented exactly once in `src/components/ui/`. Everything above composes these; nothing re-styles raw elements. Reskinning every button in the app = editing one file.

Rule: **no feature component may apply color, radius, shadow, or font utilities to a raw HTML element when a `Ui*` primitive exists for that purpose.**

## Seam 3 - Props/events contract (appearance vs behavior)

Feature components receive typed domain props and emit intent events. They never call the API and never read route params. Example:

```vue
<ModelNode
  :model="modelNodeData"
  :selected="isSelected"
  @select="..."
  @edit="..."
  @remove="..."
/>
```

A completely different visual implementation of `ModelNode` honors the same props/events and drops into the canvas unchanged.

## Seam 4 - Store-only networking (UI swap)

All data access is behind stores (ADR-006). A view is a pure projection of store state. This means the entire component tree above the stores can be deleted and rebuilt - a new shell, new views, new layout - against the same stores with zero changes to data flow.

```mermaid
flowchart TB
    subgraph Replaceable["REPLACEABLE (skin)"]
        Theme["Theme files (tokens)"]
        Ui["Ui* primitives"]
        Views["Views + feature components"]
        Shell["App shell + layouts"]
    end
    subgraph Stable["STABLE (functionality)"]
        Stores["Stores"]
        Api["API client"]
        Ws["WS manager"]
        Domain["Domain types + layout engine"]
    end
    Replaceable --> Stable
    Theme -.-> Ui
    Ui -.-> Views
    Views -.-> Shell
```

## Seam 5 - Imperative surfaces (layout swap)

Modals and edit panes are mounted through `EditSurfaceHost` from the uiStore modal stack, not embedded inline. Any edit surface can be re-presented (dialog -> slide pane -> drawer) by changing the host and shell components only; the feature that opens it is untouched. Pane sizes and the 3-column composition layout come from uiStore values and CSS, not from view logic.

## Enforcement

| Rule | Enforced by |
|------|-------------|
| No hardcoded color/radius/font values | Lint rule banning arbitrary color utilities + code review |
| Feature components only compose `Ui*` primitives | Import boundary lint (`components/ui` is the only leaf styling module) |
| Components never import `lib/api` or `lib/ws` | Import boundary lint |
| Views never import other views | Import boundary lint |
| Domain props typed, events explicit | TypeScript |

## Consequences

- Slightly more indirection up front (primitive components for everything, store actions for every network call).
- The payoff: re-theming is a CSS task; reskinning is a single-directory task; a full UI redesign touches no store, no API code, and no domain logic. This is the property every other ADR protects.
