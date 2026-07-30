# ADR-009: Replica Fidelity Policy

- Status: Accepted
- Context: this build is an **exact replica** of a running UI, captured in `visual-reference/` (69 PNGs, `MANIFEST.md`, `exact-tokens.md`). Fidelity questions were being settled per-component from whichever document a reader happened to open, and three of them (elevation, canvas zoom, grids vs tables) are visual signatures that are wrong in most reasonable-looking reimplementations. This ADR makes those decisions once.

## Decision 1 - `exact-tokens.md` is authoritative

`visual-reference/exact-tokens.md` holds **computed** values read from the running app via `getComputedStyle` and stylesheet enumeration, with `oklab()`/`oklch()`/`color-mix()` resolved to sRGB through a canvas round-trip. It supersedes every other value source in this repo, specifically `04-assets-css/design-tokens.md`, `docs/design/design-system.md`, `docs/design/theming.md`, and any number written into a spec before the capture existed.

Where they disagree, the diff table in `exact-tokens.md` section 5 is the record of why. The three high-impact entries:

| | Pre-capture belief | Live reality |
|---|---|---|
| `--agents-accent-surface-selected` | `var(--accent-500)`, i.e. a flat `#a855f7` row | `color-mix(in oklab, var(--accent-500) 18%, #fff)` = **`#efe3ff`** light, `color-mix(in oklab, var(--accent-500) 28%, #0a0a0a)` = **`#302043`** dark |
| Elevation | Tailwind `shadow-*` utilities | No `box-shadow` anywhere except the theme-toggle knob (see Decision 2) |
| Lists | `<table>` | CSS grids (see Decision 4) |

The flat `var(--accent-500)` forms are the **fallback** branch. Chrome applies the `@supports (color: color-mix(in lab, red, red))` override, and that is what the capture shows. Ship both branches, in that order.

**Conflict rule.** `exact-tokens.md` and the PNGs are two halves of one capture. Where they contradict each other, the **PNGs win** and the conflict is recorded in the spec and in `specs/REPLICA-DELTA.md`. Exactly one such conflict is known: `exact-tokens.md` 3.5 reports the inspector log table's `th` as `10px / 500 / uppercase / letter-spacing 0.25px / #737373`, while `agents-inspector-logs-light.png` and `agents-thread2-transcript-2200-light.png` show the labels title-case (`Prompt`, `Model`, `Cost`, `Tools Called`, `Called At`) in near-`#171717` at roughly 12px/600. The likeliest explanation is that the `th` selector matched a different table; the pixels are unambiguous.

**Corollary - no aesthetic improvements.** Contrast, spacing, casing and radius are replicated as captured, including the two different sans-serif stacks (`body` uses the legacy Vue-scaffold stack, everything inside `.app-container` uses `--font-sans`) and `body { font-size: 15px }`. Accessibility remediation is a later, deliberate, documented pass - not something an implementer decides row by row. Deviations require a `REPLICA-DELTA.md` entry.

## Decision 2 - depth is a painted canvas hatch, not `box-shadow`

Panels, popovers, menus and the Edit Prompt modal get their depth from a sibling `<canvas class="absolute top-0 left-0 pointer-events-none">`, sized to the panel plus 4px, inside a wrapper carrying `padding-right: 6px; padding-bottom: 6px`. It paints a **diagonal-hatch offset shadow 6px right and 6px down**, following the panel's 8px corner radius. `detail-popover-hatched-shadow-4x.png` is the 4x reference crop.

The whole app contains exactly one CSS shadow: `shadow-sm` on the theme-toggle knob in the settings popover.

**Implementation:** one reusable component, `DropShadow` (`specs/components/drop-shadow.md`), defaults `offsetX: 6, offsetY: 6, pattern: "diagonal"`. It measures its content box, samples the first child's computed `border-radius`, draws the offset silhouette minus the content silhouette, and redraws on `ResizeObserver` and on `.dark` mutation. Ink is `--dropshadow-color` / `--dropshadow-color-dark`; presets map to `--elevation-sm/md/lg`.

Why a component and not a CSS utility: the shape follows the content's measured rounded-rect, which CSS cannot express without duplicating the radius at every call site - and duplicating it is precisely how a replica drifts. One component also means a theme that wants conventional blurred elevation redefines the tokens once and re-elevates the entire UI.

**Rule:** no `shadow-*` utility may be added to any component except the theme-toggle knob. Anything that needs depth wraps in `DropShadow`.

## Decision 3 - the structure canvas zooms with the CSS `zoom` property

The canvas transform layer is:

```css
position: absolute;
transform-origin: 0 0;
transform: translate3d(tx, ty, 0);   /* pan  */
zoom: <scale>;                       /* zoom */
transition: opacity 200ms ease-out;
will-change: transform;
```

Pan is `translate3d`; zoom is `zoom`. **Not `transform: scale()`.** This is why node text stays crisp at 11% and at 51%: `zoom` re-runs layout and text rendering at the new scale, whereas `scale()` resamples a rasterized layer.

Consequences an implementer must handle, because they differ from a `scale()` canvas:

- `zoom` participates in layout, so a child's `getBoundingClientRect()` already reflects the zoom. Screen-to-canvas conversion is `(clientX - rectLeft) / zoom - tx`, and measured node sizes come back in **zoomed** pixels - divide before storing them in the layout model.
- `zoom` is not a compositor-only property. Zoom steps are discrete (`+`/`-` move in ~4-point increments, the 4th control is fit-to-screen) rather than continuous, which is what the live app does. Do not add a smooth pinch-zoom ramp.
- Panning stays on `translate3d` precisely so the common interaction remains compositor-only.
- Default view is fit-to-content: **11%** for the reference agent.
- **Open measurement.** `MANIFEST.md` says `+`/`-` step in "~4-point increments" but also that 12 `+` clicks walk 11% -> 51%, which is 3.33 points per click. The specs carry +-0.04 with the discrepancy noted; re-measure against a running build before locking it.

## Decision 4 - grids for lists, one real `<table>`

Every list surface is `display: grid` with an explicit track list. The single genuine `<table>` in the app is the inspector's log list.

Three header styles exist and are easy to conflate. They are not interchangeable:

| Surface | Header style |
|---|---|
| Agents / Threads cascade lists | `text-[11px]`, weight **600**, `letter-spacing: normal`, `text-transform: none`, `#a1a1a1`, `px-5 py-2`, row height 35px |
| Settings / CRUD lists (`/prompts`, `/models`, `/tools`, `/providers`, `/settings/*`) | **uppercase**, `tracking-wider`, ~11px, `text-neutral-500`, sort chevron right of the label |
| Inspector log `<table>` `th` | `px-4 py-2 font-medium`; see the conflict note in Decision 1 |

The cascade grid template is `grid-cols-[36px_1fr_72px_80px_1fr_32px]` with `gap-x-4`. Per ADR-008 seam 4, a column set is registered data whose tracks derive the template, so the two can never disagree.

Why grids: a row is one grid item spanning all tracks, which is what makes the full-row hover tint, the 66px two-line `Sides` cell, and the pinned 36px avatar / 32px kebab columns work without `<table>` layout fighting them. A `<table>` also cannot express the collapsed 48px `.threads-col` state.

**Rule:** do not introduce a `<table>` element. If a surface seems to need one, it needs a column set.

## Open items

These are capture observations that no single spec owns. They are logged here so
they are settled deliberately rather than guessed at during Phase 1.

1. **Page-surface grain.** `exact-tokens.md` computes `.app-container` as
   `bg-neutral-50/80` over white, which resolves to about `#fbfbfb`. Every light
   PNG measures the page at roughly `#f3f3f3` with visible per-pixel noise, i.e.
   a global texture overlay darkening surfaces by 4-5%. Nothing in the computed
   dump accounts for it. Identify it against the running app during Phase 1 and
   record it as a shell token; do not approximate it by darkening `neutral-50`.
2. **Edge elbow radius.** `edge-routing.md` carries `CORNER_R = 6`; the 51% crop
   measures roughly 15 canvas px. Measurement is noisy at that zoom - re-check
   live rather than changing the constant on the strength of the crop.
3. **Log table `th`.** The one exact-tokens-vs-PNG conflict (Decision 1).
   Re-measure once `LogsTable` exists.

## Enforcement

| Rule | Enforced by |
|---|---|
| No `shadow-*` utility outside the theme-toggle knob | grep in review; a lint rule if it recurs |
| No `<table>` outside `LogsTable.vue` | grep in review |
| No `transform: scale()` on the canvas layer | grep in review; the panzoom spec states it |
| No hardcoded `#efe3ff` / `#302043` / `#f8f2ff` / `#6527a2` | they exist only as `--agents-accent-*` |
| Deviation from the capture | must appear in `specs/REPLICA-DELTA.md` |

## Known intentional deviation

Exactly one, and it is recorded in `specs/REPLICA-DELTA.md`: the Edit Prompt modal at `/prompts/:id` has a **broken internal scroll** in the live app - content below the `Behavior` section is unreachable at any viewport. The replica reproduces the modal exactly and gives its inner container a working scroll. Replicating a bug that makes content unreachable is not fidelity, it is a defect transfer.

## Consequences

- Implementers have one place to look for "what colour / what elevation / what element", and one place to record it when they cannot comply.
- `DropShadow` runs a `ResizeObserver` and a canvas paint per elevated surface. The captured app has few of them at a time (popovers, menus, one modal) and popovers paint once at open, so the cost is bounded. If a future surface elevates hundreds of elements, that is the moment to revisit, not now.
- The `zoom` choice ties the canvas to a property with uneven historical support. It is supported in every browser this app targets and it is what the original does; matching it is the point.
