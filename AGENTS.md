# Agent Instructions: swarmy_ui

## THE SWAPPABILITY MANDATE (MOST IMPORTANT)

**Everything in swarmy_ui is SWAPPABLE.** This is the #1 architectural
principle and overrides all other style preferences:

1. Theme, colors, component appearance, and layout must ALL be changeable
   without touching core functionality.
2. Never hardcode visual values (colors, radii, shadows, spacing) in
   components. Always use design tokens (CSS custom properties).
3. Views must consume shared primitives (DataTable, Modal, ConfirmDialog,
   CopyButton, UiCodeBlock, JsonViewer, UiBadge, UiEmptyState) instead of
   bespoke inline markup, so re-skinning one primitive re-skins the whole app.
4. Layout is composition: shells, cards, panes, and grids are primitives with
   props and slots. Rearranging a layout must not require logic changes.
5. Logic (API client, stores, routing, form schemas) contains zero
   presentation concerns. Presentation components contain zero data-fetching
   details beyond their props.
6. If changing an appearance requires touching logic, the separation is
   wrong. Fix the separation.

## Naming rule

- The project name is swarmy_ui. Use it everywhere: package name, docs,
  component namespaces, commit messages.
- NEVER reference any other product name, company name, or original source
  in any file in this repo.

## Language rules

- Never use the em dash character. Use a plain dash instead.

## Modular component design guidelines

- One component per file, single responsibility, Composition API with
  script setup.
- Props down, events up. No cross-component reach-ins.
- Shared primitives live in src/components/ui/; view-specific components
  live next to their view and may compose primitives but never fork them.
- Every data-driven component takes typed props (TypeScript interfaces) and,
  where the data comes from the API, validates with Zod at the boundary.
- Slots over configuration objects for layout variation.
- Keep components small: if a component exceeds roughly 300 lines, split it
  into presentational children.
- No stray debug output (console.log) in committed code.
- Imports at the top of the file; no inline/lazy imports unless the module
  genuinely must be code-split (Monaco, Shiki).

## Build skills

This repo has agent skills installed in the .claude/skills/ directory. When working on frontend tasks, use these skills:
- shadcn-vue: Component library conventions, form patterns, styling rules
- vue: Vue 3 best practices from Vue core team members
- tailwind-best-practices: Tailwind CSS patterns and conventions
- web-design-guidelines: Accessibility and UX rules
- a11y-audit: WCAG 2.2 accessibility auditing

## Where to start

- docs/prd/ - Product Requirement Documents, one per feature area
- specs/ - Technical specs for each component and view
- plans/build-order.md - Dependency-ordered implementation phases
- api/ - API contract and typed TypeScript client (132 endpoints + WebSocket helpers)
- docs/architecture/ - Architecture overview, component tree, routing, user flows, data flow
- docs/adr/ - Architecture Decision Records (7 ADRs covering theming, forms, editor, highlighting, canvas, state management, swappability)
- docs/design/ - Design system, theming, wireframe gallery
- package.json - Tech stack: Vue 3 + Vite + Tailwind v4 + shadcn-vue (Reka UI) + VeeValidate + Zod
