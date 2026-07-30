# PORT-NOTES

State of the seeded code on `replica/spine` at the time the spine was laid
down. Everything under `src/` marked with the header

    Ported from rebuild/ Gen-1; to be reworked against replica specs.

is **starting material**, not finished code. It was copied with minimal path
adaptation and deliberately **not** refactored. This file records what is
known-broken so the rework does not have to rediscover it.

## Typecheck status

`npm install` succeeds (153 packages, 6 audit advisories: 1 moderate, 5
high - all transitive, none touched by app code yet).

`npx vue-tsc --noEmit` currently **fails**. 147 diagnostics, in three
groups:

| Count | Where | Code | Cause |
| --- | --- | --- | --- |
| 133 | `api/client/client.ts` | TS2341 / TS1117 | Pre-existing generator bugs (tracked on `main`) |
| 13 | `src/router/index.ts` | TS2307 | Imports views that do not exist yet |
| 1 | `src/stores/auth.ts` | TS2307 | Imports `@/lib/api` which does not exist yet |
| - | `src/components/legacy-port/JsonViewer.vue` | TS1002 etc. | Pre-existing syntax error, see below (masks the rest of that file) |

None of these were introduced by the port. All are expected to disappear as
the replica is built against the specs.

## 1. `api/client/client.ts` - generated client does not compile

This file is tracked on `main`; it arrived on this branch untouched. Two
independent defects, both from the generator in `11-api-client/generate.py`:

- **132 x TS2341.** `AgentBuilderApi.request()` is declared `private`
  (line 285), but all 30-odd namespace classes (`AgentsNamespace`,
  `UsersNamespace`, ...) call `this.api.request(...)` from outside the
  class. The generator emits the accessor as private and the call sites as
  external. Fix is one word - make `request` non-private (or `internal` via
  a shared base class) - but it belongs in the generator, not in a hand
  patch here, so it is left alone.
- **1 x TS1117** at line 938: an object literal with a duplicated property
  name.

There is also a **naming-rule violation**: the exported class is called
`AgentBuilderApi`, and `AGENTS.md` forbids referencing the original product
name anywhere in this repo. When the client is regenerated it should be
emitted as `SwarmyApi` (or similar). Flagged, not fixed, because renaming a
tracked generated artifact is a separate change.

## 2. `src/components/legacy-port/JsonViewer.vue` - syntax error in source

Lines 42-43 and 54-55 contain

```ts
${items.join("
")}
```

i.e. a literal newline inside a plain double-quoted string. The intent was
obviously `items.join("\n")`. This is a **pre-existing bug in the Gen-1
source** (`rebuild/src/components/JsonViewer.vue`); the ported copy is
byte-identical apart from the header comment. Verified by diff.

Left unfixed on purpose - the port is faithful. Two characters fix it when
this component is reworked.

## 3. `src/router/index.ts` and `src/stores/auth.ts` - dangling imports

Both import `@/lib/api`, the Gen-1 hand-written fetch wrapper, which was
**not** seeded: the replica's API layer is the typed client under
`api/client/` (alias `@api/*`). The router additionally imports twelve
`@/views/*.vue` files that do not exist yet.

These are the intended seams. When views land and the API layer is wired,
the imports resolve. Do not paper over them with stubs.

Router content that is worth keeping: 16 route records (one root redirect +
15 routes) and a `beforeEach` guard plus a 401 handler wired through
`setUnauthorizedHandler`. Route names and paths were transcribed from the
live app and should be treated as reference.

## 4. Deliberate deviations from the Gen-1 source

Only one, and it is a naming-rule compliance fix, not logic:

- `src/stores/auth.ts`: the `localStorage` key was renamed from
  `agentbuilder-token` to `swarmy_ui-token` (3 occurrences). `AGENTS.md`
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
