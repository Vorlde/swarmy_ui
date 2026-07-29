# swarmy_ui

swarmy_ui is a modular, themeable frontend for an AI agent-builder platform.
It provides the admin UI for composing agents, managing models, tools, and
prompts, inspecting running threads, browsing the marketplace, and
administering users, providers, API keys, and variables.

## THE #1 ARCHITECTURAL PRINCIPLE: SWAPPABILITY

**Everything in this project is designed to be SWAPPABLE.**

The theme, colors, component appearances, and layout can all be changed
without touching core functionality. This is not a nice-to-have; it is the
single most important design constraint in the codebase and it governs every
implementation decision:

- All visual styling flows through design tokens (CSS custom properties in
  `src/assets/tokens.css`). Components never hardcode colors, radii, spacing,
  or shadows. Changing the theme means changing tokens, nothing else.
- All component appearances are swappable. Every view consumes shared
  primitives (DataTable, Modal, ConfirmDialog, CopyButton, UiCodeBlock,
  JsonViewer, UiBadge, UiEmptyState) rather than inline one-off markup.
  Re-skinning a primitive re-skins every view that uses it.
- Layout is swappable. Shell structure (sidebar, cards, panes, carousel) is
  composed from layout primitives with props and slots, so a view's layout can
  be rearranged without touching its data or logic.
- Functionality (API client, stores, routing, form logic) contains zero
  presentation decisions. Logic and presentation are strictly separated.

If a change requires editing core logic to alter appearance, the code is
wrong. Fix the separation, not the symptom.

## Tech stack

- Vue 3 (Composition API, `<script setup>`)
- Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn-vue (Reka UI primitives) for form components
- VeeValidate + Zod for form state and validation
- Monaco Editor (`monaco-editor`, `@guolao/vue-monaco-editor`)
- Shiki (syntax highlighting, fine-grained `createHighlighterCore` singleton)
- Lucide icons (`lucide-vue-next`)
- Zod (runtime schema validation of API payloads)

## How to use this repo

- `docs/prd/` - Product Requirement Documents, one per feature area. Start
  here to understand what each feature must do, which API endpoints it uses,
  and its acceptance criteria.
- `specs/` - Detailed technical specs per component/view (written by spec
  authors, building on the PRDs).
- `plans/` - Build plans. `plans/build-order.md` defines the
  dependency-ordered implementation phases.
- `api/` - API contract (machine-readable JSON) and typed TypeScript client
  (132 endpoints + WebSocket helpers).

## Repository layout

```
swarmy_ui/
  README.md        this file
  AGENTS.md        agent instructions
  docs/prd/        product requirement documents
  specs/           technical specs (components, views, composition canvas)
  plans/           build-order plans
  api/             API contract + typed client
  package.json
```
