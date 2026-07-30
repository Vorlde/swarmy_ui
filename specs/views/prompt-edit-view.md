# View Spec: PromptEditView (Edit Prompt modal)

## Route

- Path: `/prompts/:id` (`:id` is the prompt name, e.g. `/prompts/customer_advocate`)
- Name: `prompt-edit`
- Auth: requires authenticated session

## Purpose

Full editor for a single prompt: identity and tool description, the model binding, the input schema, the prompt body, the tools it may call, hooks, variables, and behavior settings.

## Layout

This route does **not** render a page of its own. It mounts a `position: fixed` **Edit Prompt modal** centered over the `/prompts` list, which stays mounted and visible (heavily washed out) behind the scrim. There is no two-column Monaco/metadata split and no sticky page header.

Measured from `prompt-edit-modal-1512-light.png` / `-1920-light.png` / `-tall-1512x2400-light.png` (CSS px):

| Element | Measured |
|---|---|
| Scrim | near-opaque **white** wash in light theme (page `#f3f3f3` reads `#fdfdfd` through it); not `bg-black/50` |
| Modal card | width `~1016px` fixed at both 1512 and 1920 (a `max-w-5xl` = `1024px` wrapper minus the `6px` DropShadow gutter); horizontally centered |
| Modal height | `~725px` at an `850px` viewport, `~2074px` at a `2400px` viewport = **`~85vh`**, vertically centered (top inset `63.5px` at 850) |
| Card chrome | `bg #ffffff`, `1px solid --color-border`, radius `8px` |
| Elevation | **`DropShadow`**, `offsetX` / `offsetY` `6`, `pattern: "diagonal"` - a sibling `<canvas>` hatch, right + bottom, following the corner radius. Never `box-shadow` / `shadow-lg` |
| Header | height `60px`: `Edit Prompt` bold left, `X` icon-button right |
| Section-pill nav | height `44px`, `bg --color-neutral-100` (`#f5f5f5`), bottom border `1px --color-border` |
| Body | padding `20px`; section cards stacked with `~20px` gaps |

## Section-pill nav

A single horizontal strip of seven pills, each `icon + label`:

`Basics` | `Schema` | `Prompt` | `Tools` | `Hooks` | `Variables` | `Behavior`

- Active pill: solid `--color-neutral-900`/black fill, white label, radius `6px`.
- Idle pill: transparent, `--color-text` label, neutral icon.
- Pressed/hover pill: light neutral fill (`--color-neutral-200`-ish), dark label.
- The pills are a **scroll-spy + scroll-into-view** control over one long stack; they do not swap panes. In the capture the active pill is `Schema` while the body is scrolled to the top, and clicking `Behavior` only applies the hover fill - see the deviation note below.

## Body: one long stack of section cards

Each section is a bordered white card with an icon + title header bar and a divider, in this fixed order:

1. **Basics** - label/control rows with left-aligned labels carrying an `(i)` info glyph:
   - `Prompt Name` - single-line text input
   - `Tool Description` - resizable textarea (~4 rows)
   - `Model` - a model picker card: provider icon, model name in bold, an outlined `OPENROUTER`-style provider badge, the model id in `--font-mono`, an `in $0.09-$0.2/M  ·  out $0.18-$0.5/M` price line, capability chips (`VIS` grey/unsupported, `TOOL` / `STR` / `JSON` emerald-outlined/supported), plus `X` (clear) and chevron (open picker) buttons.
2. **Schema** - `Properties` | `JSON` underline tabs (active = accent text + accent underline); empty state is a centered box glyph, `No properties defined`, and a black `+ Add Property` button. Rendered by `SchemaEditor`.
3. **Prompt** - a tall plain textarea holding the prompt body, with the helper line `Type @ to insert schema properties, env variables, or other prompts.` (`@` rendered as an inline mono chip).
4. **Tools** - underline tab row with count badges: `Functions 0` | `Sub-prompts 0` | `Handoffs 0` | `Sub-agents 0`; below the active tab, a label (`Functions`) and a combobox placeholder `Add functions...`.
5. **Hooks** - copy `Select hooks to run when this prompt is active. Hooks execute in the order listed.` plus a dashed-border empty box: `No hooks available. Create hooks in agents/hooks/ to enable them here.` (`agents/hooks/` as an inline mono chip).
6. **Variables** - a four-column header row `Name | Type | Value | Required` and a dashed full-width `+ Add custom variable` row.
7. **Behavior** - last card in the stack.

## INTENTIONAL DEVIATION

INTENTIONAL DEVIATION: in the live app the Edit Prompt modal's internal scroll is broken - everything below the `Behavior` section header is unreachable, the section pills do not scroll their target into view, and no save/footer row can be reached. This rebuild **must** implement the modal body as a real internal scroll container (`overflow-y: auto`, `overscroll-behavior: contain`, with the header and pill strip pinned above it), so every section including `Behavior` and the footer action row is reachable, and the pills scroll their section into view and drive the active-pill scroll-spy. This is the only place where swarmy_ui deliberately differs from the captured UI.

## Components used

- `Modal` shell (fixed card + scrim + `X` close) wrapped in `DropShadow`
- `SchemaEditor` - the Schema section
- `ModelModal` / model picker card - the Basics `Model` row
- `UiButton` - `+ Add Property`, footer actions
- `ConfirmDialog` - delete and unsaved-changes confirmation
- `UiAlertBox` - save success/error feedback

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/prompts/:name` | Load prompt content, schema, tools, hooks, variables, behavior |
| GET | `/api/prompts/:name/tenvs` | Prompt-scoped env names |
| GET | `/api/variables/prompts/:name` | Resolve variables used in the template |
| GET | `/api/models` | Model picker options |
| GET | `/api/tools` | Functions / sub-prompts / handoffs / sub-agents pickers |

Save/delete submit through the `/api/prompts/:name` resource path; the view re-fetches after save and returns to `/prompts` on close or delete.

## Interactions

1. On mount (route entered from a `/prompts` row click): fetch prompt detail plus the picker option lists.
2. Closing via `X`, `Escape`, or scrim click routes back to `/prompts`.
3. Editing any field sets the dirty flag; closing while dirty raises `ConfirmDialog` ("Discard unsaved changes?").
4. Clicking a section pill scrolls that section into view inside the body scroll container; scrolling updates the active pill.
5. Typing `@` in the Prompt textarea opens the insert menu for schema properties, env variables, and other prompts.
6. `+ Add Property` appends a row to the Schema property list; the `JSON` tab shows the same schema as raw JSON.
7. `+ Add custom variable` appends a Variables row (`Name` / `Type` / `Value` / `Required`).

## States

- Loading: modal shell with skeleton section cards.
- Not found: `CenteredContentView` with "Prompt not found" and a back link.
- Dirty/clean editing states; saving; save error (inline `UiAlertBox` above the section stack).
- Empty sub-states as captured: `No properties defined`, `No hooks available. Create hooks in agents/hooks/ to enable them here.`, all Tools tab counts at `0`.

## Theming

Every value is a token reference. Card surfaces `--color-background`, borders `--color-border`, pill strip `--color-neutral-100` / dark pair, mono text `--font-mono`, capability chips on the emerald semantic pair (supported) and the neutral pair (unsupported), underline tabs on `--accent-500` / `--accent-600`. The active pill and the `+ Add Property` button use the inverted primary (black on white light / white on black dark), not the accent ramp. Elevation is the `DropShadow` token set (`--dropshadow-color`, `offsetX/offsetY 6`, `pattern "diagonal"`), so retheming depth never reintroduces a CSS shadow.

Note: the prompt body is a plain textarea in the capture, not a Monaco instance. If a future theme swaps in Monaco, bind `swarmy-light` / `swarmy-dark` themes off the `--code-theme-*` tokens; that is an enhancement, not the captured behavior.
