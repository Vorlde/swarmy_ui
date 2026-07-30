# View Spec: ToolsView

## Route

- Path: `/tools`
- Name: `tools`
- Auth: requires authenticated session

## Purpose

Browse the tool catalog available to agents. Tools are **defined in code**, not in the UI: this view is read-only. It explains the three tool kinds (functions, prompts, agents), tells the operator where to edit them on disk, and lists the discovered function tools with a view-detail action.

## Layout

App shell with `Sidebar`. The content column is a vertical stack (no card wrapper around the whole page):

1. **Page title** `Tools` - large bold (`~30px`), no count badge, **no primary action button**.
2. **Intro paragraph** - a three-line body copy block at `15px`, full content width:
   > Tools are the fundamental building blocks of how your business logic is exposed to your agents. Your prompts can expose tools for the agents to call. There are 3 types of tools: functions, prompts, and agents. Functions are actual code in your swarmy_ui codebase. Prompts are any prompts created in the prompts table (which can themselves expose tools). Agents are multi-turn conversations that can be invoked as tools.
3. **Info `UiAlertBox`** - full content width, neutral (not blue) surface `--color-neutral-50`, `1px --color-border`, radius `~12px`, circled-`i` glyph in `--color-neutral-400`:
   - line 1: `To create or modify tools, edit the agents/tools/ directory of your codebase.` (`agents/tools/` as an inline mono chip)
   - line 2 (muted): `Changes will be automatically detected.`
4. **Section header** `Functions` (bold `~20px`) + count `(16)` in `--color-neutral-400`, with the subtitle `Function tools defined in your codebase.`
5. **Search field** - `SearchInputWrapper`, placeholder `Search functions...`, `448x38`, alone on its row (no selects).
6. **`DataTable` card** - same chrome as every other list card: `bg --color-background`, `1px --color-border`, radius `12px`.

The `main` element owns its own vertical scroll; the 1512x850 capture is clipped at the viewport bottom, so any further sections below the Functions table were not captured.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Tools                                                        |
|        |  Tools are the fundamental building blocks of how your        |
| Side   |  business logic is exposed to your agents. ... (3 lines)      |
| bar    | +----------------------------------------------------------+ |
|        | | (i) To create or modify tools, edit the `agents/tools/`   | |
|        | |     directory of your codebase.                           | |
|        | |     Changes will be automatically detected.               | |
|        | +----------------------------------------------------------+ |
|        |  Functions (16)                                               |
|        |  Function tools defined in your codebase.                     |
|        |  [ (o) Search functions...      ]                             |
|        | +----------------------------------------------------------+ |
|        | | TOOL NAME ^v      | DESCRIPTION                  | ACTIONS | |
|        | |-------------------+------------------------------+---------| |
|        | | check_customer_history | Pull the customer history... | (eye) | |
|        | | check_refund_policy    | Check whether an order ...   | (eye) | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

Column set as captured: `TOOL NAME` (sortable) | `DESCRIPTION` | `ACTIONS`.
The only row action is an **eye (view) icon button**. There is no Add/Edit/Delete affordance anywhere on this page. Description cells wrap to two lines, so row height is content-driven (~`86px` for two-line rows) rather than the fixed `60px` used by single-line tables.

Header row style is the shared `DataTable` header: `11px`, uppercase, letter-spacing ~`0.05em`, `--color-neutral-500`, on a `--color-neutral-50` bar with a `1px --color-border` bottom rule.

## Components used

- `DataTable` - function list (read-only: no `primaryAction`, no destructive actions)
- `UiAlertBox` (`variant="info"`) - the "edit `agents/tools/`" notice
- `UiCodeBlock` (inline mode) - the `agents/tools/` path chip
- `SearchInputWrapper` - function search
- `JsonViewer` - tool input schema in the view-detail surface opened by the eye action
- `CenteredContentView` - page wrapper

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/tools` | List tools (map of name -> `{ description, schema, variables, hasError, type }`) |
| GET | `/api/tools/:name` | Tool detail for the view action |
| GET | `/api/variables/tools/:name` | Variables referenced by a tool |

The tool list response is an object keyed by tool name; normalize to an array of rows `{ name, description, schema, variables, hasError, type }` before passing to `DataTable`. Filter to `type === "function"` for the `Functions` section.

## Interactions

1. On mount: fetch `/api/tools`, normalize the map to rows, count them into the `Functions (N)` header.
2. Search filters by name and description.
3. Column header click toggles sort on `TOOL NAME`.
4. The eye action opens the tool's read-only detail (description + `JsonViewer` of the input schema). No create, edit, or delete path exists in the UI - the info alert is the documented way to change tools.
5. `hasError` tools surface a danger badge and the error message in the detail surface.

## States

- Loading: `DataTable` skeleton rows.
- Empty: `DataTable` empty block (circular neutral badge + inbox glyph + muted message).
- Error: `UiAlertBox` variant `error` with retry.
- Detail: schema present (`JsonViewer`), schema null ("No schema defined" placeholder), error state (`hasError`).

## Theming

Table, alert, and chips consume shared tokens only. The info alert is the **neutral** variant pair (`--color-neutral-50` surface / `--color-border` / `--color-neutral-400` icon), not a blue-tinted info scale - remapping the neutral ramp restyles it. The `JsonViewer` syntax colors come from the dedicated JSON token set (keys `--accent-600` light / `--accent-400` dark), so retheming JSON display is a token-only change. Error badge uses the red semantic tokens. Cards carry no `box-shadow`; depth in this app comes only from `DropShadow` on overlays.
