# Build Order - swarmy_ui

Dependency-ordered implementation phases. Each phase lists what to build, its
dependencies, and estimated effort. Phases must be completed in order; items
within a phase can usually run in parallel.

Guiding constraint for every phase: theme, appearance, and layout are
swappable through tokens and shared primitives. No phase may hardcode visual
values.

## Phase 1: Scaffold + auth + design tokens

**What to build:**
- Vite + Vue 3 + TypeScript project scaffold with Tailwind v4
  (`@tailwindcss/vite`), vue-router, `@vitejs/plugin-vue`, vue-tsc.
- Configurable base path (`/` in dev, configurable for production deploy).
- Design tokens: `src/assets/tokens.css` with CSS custom properties for
  color, spacing, radius, and font (light + dark variants).
- Brand assets (logo light/dark, favicon).
- Router shell with named routes and a global auth guard (`meta.public` only
  on login).
- Auth store: `POST /api/auth/login`, `GET /api/auth/me` on boot, global
  401 -> `/login` redirect, token persistence.
- LoginView (username/password form, error states).

**Dependencies:** none.
**Estimated effort:** 3-4 days.

## Phase 2: Shared primitives + API client

**What to build:**
- Typed API client integration (from `11-api-client/src/`: client.ts,
  types.ts, schemas.ts, stream.ts). All HTTP goes through this layer.
- WebSocket layer: `/api/events`, `/api/threads/:id/stream`,
  `/api/threads/:id/logs` tailing.
- Shared UI primitives in `src/components/ui/`: DataTable, Modal,
  ConfirmDialog, CopyButton, UiCodeBlock, JsonViewer, UiBadge, UiEmptyState,
  UiButton, Loader.
- shadcn-vue (Reka UI) form components (Combobox, Calendar, Switch,
  NumberField, TagsInput, etc.) wired to VeeValidate (`useForm`, `useField`)
  with Zod schemas via `@vee-validate/zod`; shared form-field wrappers in
  `src/components/ui/form/`.
- Monaco wiring (`@guolao/vue-monaco-editor`, Vite `?worker` workers) and the
  Shiki `createHighlighterCore` singleton.
- App shell: Sidebar + top-level layout primitives (cards, panes), all
  token-driven.

**Dependencies:** Phase 1 (tokens, auth store, router).
**Estimated effort:** 5-7 days.

## Phase 3: CRUD views (settings and management)

**What to build:** (per PRDs in `docs/prd/`)
- ModelsView + ModelModal (list, provider config, available models,
  capabilities, endpoints, curl data).
- ToolsView (tool list, tool detail, function tools).
- ProvidersView (provider list, icons, provider tools).
- PromptsView + PromptEditView + PromptModal (prompt library, Monaco editing).
- MarketplaceView (browsing via platform proxy endpoints).
- UsersView (user CRUD).
- ApiKeysView (API key list/create/delete).
- VariablesView (variable management per agent/prompt/tool).
- ThreadsView (thread list with live `/api/events` updates).

All views consume Phase 2 primitives and the typed client; no view writes its
own table/modal/dialog markup.

**Dependencies:** Phase 2.
**Estimated effort:** 8-10 days (parallelizable per view).

## Phase 4: Composition canvas

**What to build:**
- CompositionView as a horizontal snap-scroll carousel of three cards:
  Agents | Threads (with embedded inspector) | Structure.
- Structure tree card with resizable split (left tree, right detail pane).
- Custom SVG canvas for agent composition: CanvasEdges, CanvasGrid, pan/zoom,
  ELK-style layout, AgentNode, InspectorPanel.
- Pack/unpack/publish flows (analyze, metadata, packed-info, publish,
  npm-token-status).

**Dependencies:** Phase 2 (primitives, client), Phase 3 (agents/models/tools
data available for node configuration).
**Estimated effort:** 2-4 weeks (largest single item; custom SVG work).

## Phase 5: Thread inspector

**What to build:**
- ThreadInspectorPane embedded in the Threads card of CompositionView and
  reachable from ThreadsView.
- Tabs: Logs, Files (filesystem browser + editor), KV Store, Effects,
  Config; plus Messages view and Cost display.
- Live updates via `/api/threads/:id/stream` and logs tailing.
- Message composer (post message, attachments, silent flag), stop / continue
  / revive actions, pending tool calls, per-log provider inspection.

**Dependencies:** Phase 2 (WS layer, Monaco, Shiki), Phase 3 (ThreadsView),
Phase 4 (embedding into the Threads card).
**Estimated effort:** 7-10 days.

## Phase 6: Marketplace (full)

**What to build:**
- Full marketplace browsing experience backed by the platform proxy
  (`/api/platform/**`, `/api/platform-session/**`).
- Package detail, install (unpack) flow into local agents, publish flow from
  an agent to the marketplace.
- Platform auth session handling where required.

**Dependencies:** Phase 3 (MarketplaceView skeleton), Phase 4 (pack/unpack
flows).
**Estimated effort:** 4-5 days.

## Phase 7: Polish, theming, hardening

**What to build:**
- Theme swap validation: prove full re-theme via tokens only (dark theme as
  the acceptance test).
- Empty/loading/error states on every view via UiEmptyState.
- Responsive pass, keyboard navigation, focus management in modals.
- Zod validation coverage on all key payloads.
- Typecheck-clean build, bundle-size pass (Monaco/Shiki code-split).

**Dependencies:** Phases 1-6.
**Estimated effort:** 4-6 days.

## Rough totals

| Phase | Effort |
|-------|--------|
| 1. Scaffold + auth + tokens | 3-4 days |
| 2. Primitives + API client | 5-7 days |
| 3. CRUD views | 8-10 days |
| 4. Composition canvas | 2-4 weeks |
| 5. Thread inspector | 7-10 days |
| 6. Marketplace | 4-5 days |
| 7. Polish + hardening | 4-6 days |
