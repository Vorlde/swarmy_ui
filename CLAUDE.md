# swarmy_ui - replica/spine worktree

You are in a git worktree on branch `replica/spine`. Mission: build a pixel-exact replica of
the agent-platform UI running live at http://localhost:5173 (login: admin / admin; also in
`../.env`), with a pluggable spine so future features are plug swaps, not rewrites.

## Read in this order (all in this repo)

1. `AGENTS.md` - repo rules. Critical: the original product's name must NEVER appear in code
   or docs (fixtures are the only exception).
2. `docs/adr/adr-009-*.md` - replica fidelity policy: `docs/visual-reference/exact-tokens.md`
   is the single authority for values; screenshots win conflicts; no aesthetic improvements.
3. `docs/adr/adr-008-*.md` - plugin spine: 4 registration seams (views/routes, inspector tabs,
   canvas node types, list columns). Adding a feature must edit no core file.
4. `plans/build-order.md` - 8 phases, parallel-agent-sized, named screenshots as exit criteria.
5. `specs/REPLICA-DELTA.md` - what changed in the specs after the live audit + the ONE
   intentional deviation (Edit Prompt modal keeps its exact look but with working inner scroll).
6. `specs/` (63 files) + `docs/prd/` - per-view/component behavior.

## Ground truth assets

- Screenshots (69 PNGs, 91 MB, NOT in git): `../visual-reference/` - one folder up, next to
  this worktree. Index: `docs/visual-reference/MANIFEST.md` (in-repo copy).
- Exact computed tokens: `docs/visual-reference/exact-tokens.md` (in-repo copy; the original
  lives at `../visual-reference/exact-tokens.md`).
- Live API payloads: `api/fixtures/*.json` (13 real captures - use for types and dev mocks).
- API contract (132 endpoints): `api/contract/api-contract.json`; typed client
  `api/client/` (class `PlatformApi`, WS helpers in `stream.ts`); networking seam `src/lib/api.ts`.
- The live app itself is running 24/7 - when a screenshot is ambiguous, verify against
  localhost:5173 (read-only: never delete/save/submit there).

## Current state

- `npm install` done, `npx vue-tsc --noEmit` GREEN. Stack: Vue 3 + Vite + Tailwind v4 +
  shadcn-vue (Reka UI) + VeeValidate + Zod + Monaco + Shiki.
- Seeded starting code: `src/assets/tokens.css`, `src/stores/auth.ts`, `src/router/`
  (routes as data in `routes.ts`, resolved via the view registry), `src/components/legacy-port/`
  (8 ported Gen-1 components incl. DataTable - rework against specs, do not trust blindly).
- `PORT-NOTES.md` - port history and known quirks.
- Open investigation (phase 1): light-theme PNGs measure the page bg at ~#f3f3f3 with
  per-pixel grain vs computed ~#fbfbfb - find the global texture/noise overlay in the live app.

## Rules of engagement

- Fidelity: match `exact-tokens.md` and the PNGs exactly. Depth = the 6px diagonal hatch
  canvas component, never box-shadow. Canvas zoom = CSS `zoom` property. Lists are CSS grids
  (11px/600 headers, not uppercase); only the log table is a real <table> (10px/500 uppercase).
- Pluggability: every view, inspector tab, canvas node type, and column set goes through the
  ADR-008 registries. No hardcoding to "pass the screenshot".
- Git: commit in logical steps on this branch. No co-author lines. Never push, never touch
  `main` or sibling folders outside this worktree (read-only references are fine).
- Work through `plans/build-order.md` phase by phase; a phase is done when its named
  screenshots are visually matched by the running dev app (`npm run dev`, proxy `/api` to the
  live backend or serve `api/fixtures/` mocks).
