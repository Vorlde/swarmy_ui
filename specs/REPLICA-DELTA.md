# REPLICA-DELTA

Audit record for the spec pass against `visual-reference/` (69 PNGs +
`MANIFEST.md` + `exact-tokens.md`). **51 specs changed.** One line per spec:
what it claimed, what the capture shows. Policy lives in ADR-009.

Four corrections recur; they are stated once here rather than in every line.

- **G (grid)** - lists are CSS grids, not `<table>`. Cascade lists use an 11px/600
  non-uppercase header; settings/CRUD lists use an uppercase tracked header; the
  inspector log list is the only real `<table>`.
- **S (shadow)** - no `box-shadow`. Depth is a canvas-painted diagonal hatch,
  6px right + 6px down, via `DropShadow`. Only exception: the theme-toggle knob.
- **A (accent)** - selected surface is `color-mix(in oklab, accent-500 18%, #fff)`
  = `#efe3ff` / `#302043`, never flat `#a855f7`.
- **P (plug)** - a hardcoded `v-if`/switch over a pluggable type became a
  registry lookup (ADR-008).

---

## Views

| Spec | Was | Now |
|---|---|---|
| `views/agents-view.md` | standalone `AgentsView` at `/agents` pushing to `/agents/:id`; `DataTable`; filter chips | pane 1 of the cascade; selection in `?agent=`; no `/agents/:id` route; grid `36px 1fr 72px 80px 1fr 32px` gap-x-4, 66px rows; segmented control. **G A** |
| `views/composition-view.md` | `/agents/:id`, one card split rail\|canvas\|inspector, `h-12` toolbar | `/agents` + `?agent=&thread=`; horizontal snap cascade, `scroll-snap-type: x mandatory`, 12px gap, measured section widths 782/1143/1223; no toolbar; entry is a scroll, not a transform. **P** |
| `views/threads-view.md` | paginated page with agent dropdown, date filter, pager; row click navigates away | same cascade minus section 1; magnifier-to-search, `+`, no pager/filters; sub-agent thread groups; `/threads/:id` is the deep-link form of selection; inspector tabs collapse behind `...` |
| `views/thread-inspector-view.md` | full-page view, tabs `Messages\|Logs\|Files\|KV\|Effects\|Cost`, Messages default | pane, tabs `Logs`(default)`\|Files\|KV Store\|Effects\|Agent Configuration\|Thread Settings`; Messages is a sibling pane; no Cost tab (mono chip in the Messages header); active pill is a separate sliding element; log detail slides up with 4 stat tiles. **P G** |
| `views/prompts-view.md` | columns Name/Variables/Updated, "+ New Prompt" | `NAME\|DESCRIPTION\|MODEL\|CREATED\|ACTIONS`; "Create Prompt" 159x36 r8; search 448x38 + "All Models" 220x38; card 1189px r12; 40px header, 60px rows; row click opens the `/prompts/:id` modal. **S** |
| `views/prompt-edit-view.md` | two-column Monaco + metadata page | fixed modal ~1016x85vh, white scrim, 60px header, 44px section-pill strip, one stacked section list (Basics/Schema/Prompt/Tools/Hooks/Variables/Behavior). **S** + the one deviation below |
| `views/tools-view.md` | CRUD with "+ Add Tool", edit modal, delete | read-only: intro copy, neutral info alert ("edit the `agents/tools/` directory"), `Functions (16)`, `TOOL NAME\|DESCRIPTION\|ACTIONS` with an eye-only action |
| `views/models-view.md` | columns Provider/Model ID, pagination, one search | `NAME\|MODEL\|PROVIDER\|FALLBACKS\|ACTIONS`; no pagination; search + All Models + All Providers; primary button is inverted neutral, not accent. **S** |
| `views/providers-view.md` | Icon/Name/Status/Models, Edit action, test-connection, schema modal | `NAME\|API KEY\|ACTIONS` (trash only); no primary button, no edit modal; status pills measured |
| `views/marketplace-view.md` | two-pane card grid, `shadow-sm`/`shadow-md` | one header row; sort is a native `<select>` (`Recently updated` / `Most installed`); empty state verbatim "No packages have been published yet." with zero links or buttons in `main`. **S** |
| `views/users-view.md` | `/users`, "+ Add User", search | `/settings/users` (reached from the gear popover); "Add User"; no search; `USERNAME\|ROLE\|CREATED\|ACTIONS`; empty "No users found" |
| `views/api-keys-view.md` | `/api-keys`, hosted-only unavailable state | `/settings/api-keys`; no unavailable state; `NAME\|API KEY\|CREATED\|LAST USED\|ACTIONS`; empty "No API keys found" |
| `views/variables-view.md` | `/variables` with Instance/Agents/Prompts/Tools tabs + scope selector | two routes `/settings/my-variables` and `/settings/instance-variables`; single card; exact resolution-order copy; dashed "No stored variables yet."; key+value+lock+trash rows; "Save Variables"; verbatim super-admin banner |
| `views/login-view.md` | logo + "Sign in to your workspace" inside a ~360px card | lockup **above** the card; card measured 440x260 r8, no title or tagline; placeholders "Enter your username"/"Enter your password"; full-width inverted "Sign in". **S** |

## Components

| Spec | Was | Now |
|---|---|---|
| `components/data-table.md` | generic `<table>` with a `width` per column | the grid list primitive: `track` per column derives `grid-template-columns`; `headerStyle: "plain" \| "caps"`; column sets come from the `listColumns` registry; kebab menu geometry recorded. **G P A** |
| `components/drop-shadow.md` | defaults 8/8, `crosshatch` | defaults **6/6, `diagonal`**; canvas = content + 4px inside a 6px right/bottom padded wrapper; draws offset silhouette minus content silhouette; painted once at popover open, never animated in. **S** |
| `components/sidebar.md` | user/email row, inline theme toggle, accent-tinted active item | 240px/64px, transparent rail; measured nav-item metrics; active item is a neutral fill, not accent; footer is gear + logout only; full settings-popover and agent-switcher anatomy; `sidebar-cascade-in`; nav config array named as the plug point. **P S** |
| `components/modal.md` | `bg-black/50` backdrop, `shadow-xl` | near-opaque **white** scrim (`--modal-scrim`, measured `#fdfdfd` over `#f3f3f3`); fixed ~1016px / ~85vh; body is the scroll container. **S** |
| `components/prompt-modal.md` | side-by-side CONTENT\|VARIABLES container-query layout | 60px header, 44px section-pill strip, one stacked section list; accent-vs-inverted primary split spelled out |
| `components/model-modal.md` | no elevation or selected-model detail | measured summary row (provider glyph, `OPENROUTER` badge, mono model id, in/out prices, VIS/TOOL/STR/JSON chips); inverted footer save. **S** |
| `components/schema-editor.md` | "visual"/"code" segmented toggle | `Properties`/`JSON` underline tabs on a full-width baseline; captured empty state ("No properties defined" + black "+ Add Property") |
| `components/search-input-wrapper.md` | `--color-background-soft`, no measurements | `--color-background`; 448x38 r8 `#d4d4d4`, adjacent 220x38 selects at 12px gap; 34px preset for the agents column |
| `components/ui-button.md` | primary = `--accent-600/700` | primary is the **inverted neutral** (`#000` on white / white on black) via `--btn-primary-bg/-fg`; accent must not recolor it; 36px h, r8. **S** |
| `components/ui-alert-box.md` | generic blue/green/amber/red | `info` is **neutral** (`#fafafa` / `#d4d4d4`); `error` measured `#fef2f2` / red-200 / red-600. **S** |
| `components/confirm-dialog.md` | `shadow-lg`, translucent black backdrop | `DropShadow` + the shared near-opaque white scrim; `--color-background`. **S** |
| `components/centered-content-view.md` | opaque `--color-background` | page background `bg-neutral-50/80` over white (dark `bg-black`); 32px gutter, main border at x240, 1189px content column |

## Composition canvas

| Spec | Was | Now |
|---|---|---|
| `composition-canvas/panzoom.md` | `translate3d + scale()`, dual render modes, x1.25 steps | single mode `translate3d + zoom + transform-origin: 0 0`; translate restated in **canvas** units; pan delta, arrow step and clamp padding all divided by scale; zoom-to-cursor re-derived; `+-0.04` steps; default fit 11% |
| `composition-canvas/overview.md` | 3-column browser\|canvas\|inspector screen, canvas toolbar | Structure = cascade snap section 3; six node kinds; CSS zoom; screen-space dot grid; node registry; Pack from the Agents-row kebab. **P S** |
| `composition-canvas/domain-model.md` | `NodeType 'agent\|side\|tool\|hook\|model'`, `theme.node.shadow` | `NodeKind 'agent\|prompt\|human\|function\|subagent\|model'` on a `kind` discriminator; `nodeRegistry`; full `data-*` list; hooks render no node. **P S** |
| `composition-canvas/edge-routing.md` | cubic beziers, accent-coloured per side | orthogonal polylines with rounded elbows; every sampled edge pixel is one neutral (~`#dcdcdc`); only dashing marks model edges; `data-edge-*` stamped |
| `composition-canvas/wireframe.md` | invented generic cards and tree | all six cards transcribed from the 51% crops; real structure tree; controls `bottom-4 left-4` |
| `composition-canvas/build-plan.md` | old types, dual transform, lock button | registry-first; CSS-zoom, screen-space-grid, no-box-shadow and registry-drill acceptance tests. **P S** |
| `composition-canvas/api-binding.md` | `/api/hooks` feeding a `HookNode` | hooks produce no canvas node; pack/unpack launch from the Agents-row kebab |
| `.../CompositionCanvas.md` | per-type dispatch, `scale()`, dashed groups | `nodeRegistry[node.kind]`, zoom layer, exact viewport/group classes. **P A** |
| `.../CanvasControls.md` | bottom-right, 5 controls, `shadow-sm` | `bottom-4 left-4 rounded-lg`, 4 controls, exact readout classes. **S** |
| `.../CanvasGrid.md` | generic theme-sized pattern | exact `#canvas-dot-grid` 24/12/r=1 at `/20`, confirmed **screen-space**; the 20x20 `r=0.75` group sub-grid is a separate in-layer pattern |
| `.../CanvasEdges.md` | cubic beziers, per-side strokes | orthogonal rounded elbows, all-neutral palette, `data-edge-*` |
| `.../AgentNode.md` | "TYPE - N sides" anatomy, "hover raises the shadow" | two-band anatomy (AGENT eyebrow, AI+HUMAN pill, VARIABLES column, per-side summary columns); `#171717` border. **S P** |
| `.../SidePromptNode.md` | PromptCard variant with a model anchor row | registered under `prompt` and `human`; three-band PROMPT anatomy, header model chip as `data-model-anchor`, 4-section rail; side accent lives on the card border. **P** |
| `.../PromptCard.md` | "used for prompt-tools on the canvas" | prompt-tools are rail entries; `modelRowBackground` -> `modelChipBackground` + `railColors` |
| `.../ModelNode.md` | capability chips, `ctx N - out M`, fallbacks footer | three bands: MODEL eyebrow + OPENROUTER pill, model id + price line, 2x2 hairline capability cells, MAX CONTEXT / MAX OUTPUT; no fallbacks footer |
| `.../ToolNode.md` | 6 tool kinds -> 3 variants via `toolCardMap` | registered under `function` only; other tool kinds are rail entries or their own kind; registry replaces `toolCardMap`. **P** |
| `.../FunctionToolCard.md` | name-over-kind subtitle, `in: N - out: M`, chevron | FUNCTION eyebrow, two-column name/description header, ARGS band with mono name, red `*`, type chip; args expanded by default |
| `.../AgentLockupCard.md` | arrow + `target: <agent>` lockup | full SUB-AGENT card (DUAL AI pill, `max N session turns`, VARIABLES, WORKER/REVIEWER columns); handoffs are rail entries |
| `.../HookNode.md` | implied a rendered node | banner: not in any capture, not in `NodeKind`, must not be registered. **P** |
| `.../StructureTree.md` | "alternative view instead of the graph" | permanent left half of the Structure pane; exact classes, resizer, `localStorage["composition.structureTreeWidth"]` |
| `.../StructureTreeRow.md` | `NodeType` prop, generic row | `NodeKind \| 'group' \| 'section'` plus trailing value/count and editable props; 12px body. **A** |
| `.../CompositionView.md` | three-column flex, browser 260 / inspector 320 | supplies the Structure snap section only; provides `nodeRegistry`; entry is a scroll. **P** |
| `.../InspectorPanel.md` | canvas-adjacent node inspector | placement banner: it is snap section 2's third column with the thread tab strip; `node.type` -> `node.kind` |
| `.../AgentBrowserPanel.md` | left sidebar panel | placement banner: it is snap section 1, a CSS grid, kebab `Edit / Pack / Delete`; canonical spec is `views/agents-view.md`. **G** |
| `.../PackModal.md` | modal tokens listed "shadow" | hatch-canvas depth. **S** |

**Inspected, unchanged (11):** `components/ui-code-block.md`, `components/json-viewer.md`, `components/copy-button.md`, and `composition-canvas/components/{DataTreeView, DataTreeRow, VariablesList, EditRegion, DependencyTree, ExtractCopyToggle, UnpackModal, UnpackTree, PublishModal}.md` - none contradicts the capture.

**Also corrected outside `specs/`:** `docs/architecture/routing.md` (route map still listed `/agents/:id`, `/threads/:id` as `thread-inspector`, and top-level `/users` `/api-keys` `/variables`; now matches `src/router/routes.ts` and the query-string deep-link contract).

---

## The one intentional deviation

**The Edit Prompt modal at `/prompts/:id` gets a working internal scroll.**

In the live app the modal is `position: fixed` and its inner scroll container is
broken: at every captured viewport, including 1512x2400, content below the
`Behavior` section is unreachable, and `fullPage` capture does not grow to fit
it (`MANIFEST.md` records this). The replica reproduces the modal exactly -
geometry, scrim, hatch shadow, 44px section-pill strip, one stacked section list
- and gives the inner container a working scroll so `Behavior` can be reached.

Replicating a defect that makes content unreachable is not fidelity. This is the
only deviation in the build; it is marked `INTENTIONAL DEVIATION:` in
`specs/views/prompt-edit-view.md` and called out in phase 7 of
`plans/build-order.md`.

## Conflicts inside the capture (not deviations)

Recorded here so nobody "fixes" them by guessing. Per ADR-009 the PNGs win, and
each is re-measured against the running build in phase 8.

1. **Log table `th`.** `exact-tokens.md` 3.5: 10px / 500 / uppercase / 0.25px /
   `#737373`. The PNGs: title-case `Prompt / Model / Cost / Tools Called /
   Called At`, near-`#171717`, roughly 12px/600. Likely a selector that matched a
   different table.
2. **Page-surface grain.** Computed `.app-container` is `bg-neutral-50/80` over
   white (about `#fbfbfb`); every light PNG measures roughly `#f3f3f3` with
   per-pixel noise, i.e. an unaccounted global texture overlay.
3. **Zoom step.** "~4-point increments" versus 12 `+` clicks walking 11% -> 51%
   (3.33 points/click). Specs carry `+-0.04`.
4. **Edge elbow radius.** `CORNER_R = 6` versus about 15 canvas px measured at
   51% zoom, where measurement is noisy. Constant left alone.
5. **Marketplace sort.** `MANIFEST.md` calls it "sort tabs"; the PNG shows a
   native `<select>`. Spec follows the PNG.
