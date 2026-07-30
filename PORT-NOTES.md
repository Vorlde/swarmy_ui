# PORT-NOTES

State of the seeded code on `replica/spine`. Everything under `src/` marked
with the header

    Ported from rebuild/ Gen-1; to be reworked against replica specs.

is **starting material**, not finished code. It was copied with minimal path
adaptation and deliberately **not** refactored. This file records what was
known-broken, and what has since been fixed, so the rework does not have to
rediscover any of it.

## Typecheck status

`npm install` succeeds (153 packages, 6 audit advisories: 1 moderate, 5
high - all transitive, none touched by app code yet).

`npx vue-tsc --noEmit` is **GREEN** (0 diagnostics) as of the spine commit.

The four defect groups recorded in the first draft of this file are all
resolved:

| Was | Where | Resolution |
| --- | --- | --- |
| 132 x TS2341 | `api/client/client.ts` | Generator now emits `request` as public + `@internal`; client regenerated |
| 1 x TS1117 | `api/client/client.ts` | Generator de-duplicates body field names; `createMessage` emits `content` once |
| TS1002 | `src/components/legacy-port/JsonViewer.vue` | Literal newline in `items.join("\n")` fixed in both places |
| 13 x TS2307 | `src/router/index.ts`, `src/stores/auth.ts` | `src/lib/api.ts` added; router moved onto the view registry |

## 1. `api/client/client.ts` - FIXED

Two generator defects and one naming-rule violation, all fixed at the source
in `11-api-client/generate.py` and then regenerated into this worktree:

- **132 x TS2341.** `request()` was emitted `private` while all 30-odd
  namespace classes call `this.api.request(...)` from outside the class. It
  is now emitted `public` with a `/** @internal - used by namespace classes;
  not part of the public surface. */` JSDoc. `onUnauthorized` stays private.
- **1 x TS1117.** The contract lists both `content` and `content = ""` for
  `POST /threads/:id/messages`; `sanitize_field` collapsed them to the same
  name and the body literal got a duplicate key. `decompose_fields()` now
  de-duplicates body field names order-preservingly, matching the dedupe that
  was already applied to the request *type*.
- **Naming rule.** The exported class is now `PlatformApi`, not the original
  product name. `stream.ts`, `index.ts` and `README.md` follow.

The regenerated output was diffed against the previous worktree copy: the
only differences are those three changes, so no unrelated generator drift
was pulled in.

## 2. `src/components/legacy-port/JsonViewer.vue` - FIXED

Two occurrences of

```ts
${items.join("
")}
```

i.e. a literal newline inside a plain double-quoted string, a pre-existing
bug in the Gen-1 source. Both are now `items.join("\n")`. The file
typechecks clean; nothing else in it was touched.

## 3. `src/router/index.ts` and `src/stores/auth.ts` - FIXED via the spine

The dangling imports were real seams, and they were closed with real code
rather than stubs:

- **`src/lib/api.ts`** now exists: it is the single networking seam. It
  exports `platformApi()` (the generated `PlatformApi` bound to the current
  session token) and `api()` (a thin `fetch` wrapper on the same base URL and
  auth header, for the auth endpoints the generator does not model), plus the
  `setUnauthorizedHandler` the router already expected. `src/stores/auth.ts`
  is unchanged - it compiles against this module as written.
- **The twelve `@/views/*.vue` imports are gone.** Route records moved to
  `src/router/routes.ts` as data, each naming a *view id*; the router
  resolves that id through the `views` registry in `src/plugins/registry.ts`
  (ADR-008). An unresolved id renders `unregisteredView(id)`, a one-line
  diagnostic component, so the route table can be complete and typechecked
  before any view exists. This is the seam, not a stub per view: when a
  feature plug registers `login`, `/login` starts working with no core edit.

The 16 route records (one root redirect + 15 routes), their names and paths,
and the `beforeEach` guard are unchanged from the transcription of the live
app and remain reference material.

## 4. Deliberate deviations from the Gen-1 source

Only one, and it is a naming-rule compliance fix, not logic:

- `src/stores/auth.ts`: the `localStorage` key was renamed from
  the original product's token key to `swarmy_ui-token` (3 occurrences). `AGENTS.md`
  forbids the original product name in any file. Behaviour is identical;
  existing local sessions from the Gen-1 app simply will not be picked up,
  which is correct for a separate app.

Everything else under `src/` is a byte-faithful copy plus a one-line header.

## 5. Brand assets

`public/assets/brand-logo-dark.svg`, `brand-logo-light.svg`, and
`brand-favicon.svg` are the original product's marks, renamed neutrally per
the `AGENTS.md` naming rule. **The artwork itself is still the original
product's logo.** It is kept only as a placeholder so layout work has
correctly-proportioned art to position; it must be replaced with swarmy_ui
branding before anything ships.

## 6. Fixtures

`api/fixtures/*.json` are 13 real captured API responses. They are the
ground truth for the shapes in `api/client/types.ts` and are intended to
back a dev-mode mock layer. They are captures, not fabrications - do not
edit them to make code pass; fix the code.

## Components that are clean

The other seven ported components - `DataTable.vue` (571 lines, generic),
`Modal.vue`, `ConfirmDialog.vue`, `CopyButton.vue`, `UiCodeBlock.vue`,
`UiButton.vue`, `UiAlertBox.vue` - typecheck with zero errors and have no
imports outside `vue`, `lucide-vue-next`, and each other. They are the most
directly reusable material in the seed. They still need to be reconciled
with `specs/components/` before they count as done.
