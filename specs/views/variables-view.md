# View Spec: VariablesView

## Route

- Path: `/variables`
- Name: `variables`
- Auth: requires authenticated session

## Purpose

Manage shared variables (environment-style key/value pairs) that agents, prompts, and tools can reference. Variables can be scoped (instance, per-agent, per-prompt, per-tool) and can be marked secret.

## Layout

App shell with `Sidebar`. Content is a scope selector (tabs: Instance / Agents / Prompts / Tools) above an editable grid of variable rows. Each row is a `scoped-env-row` grid: key, value, type toggle, delete button. An "Add variable" row sits at the bottom; a sticky footer holds Save.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Variables                                                   |
|        |  [Instance] [Agents] [Prompts] [Tools]        scope: agents  |
| Side   |  Agent: [ support-agent v ]                                  |
| bar    | +----------------------------------------------------------+ |
|        | | Key              | Value            | Type   |           | |
|        | |------------------+------------------+--------+-----------| |
|        | | COMPANY_NAME     | Acme Inc         | text   | [x]       | |
|        | | REFUND_API_TOKEN | **************** | secret | [x]       | |
|        | | [+ Add variable]                                    [Save]| |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

## Components used

- `UiButton` - Save, add row
- `ConfirmDialog` - row delete and unsaved-changes on scope switch
- `UiAlertBox` - save feedback
- `SearchInputWrapper` - filter rows by key

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/envs/instance` | Instance-scope variables |
| PATCH | `/api/envs/instance` | Save instance-scope variables |
| GET | `/api/variables/agents/:name` | Agent-scope variables |
| GET | `/api/variables/prompts/:name` | Prompt-scope variables |
| GET | `/api/variables/tools/:name` | Tool-scope variables |
| GET | `/api/agents` | Agent names for the scope selector |
| GET | `/api/prompts` | Prompt names for the scope selector |
| GET | `/api/tools` | Tool names for the scope selector |

## Interactions

1. On mount: fetch instance env plus the name lists for the scoped selectors.
2. Switching scope or target name re-fetches the matching variables endpoint; if the grid is dirty, `ConfirmDialog` asks to discard changes first.
3. Rows are edited inline; `secret` type masks the value input.
4. "Add variable" appends an empty row; empty-key rows are dropped on save.
5. Save sends the full variable map via the matching PATCH endpoint and shows `UiAlertBox` success/error.
6. Row delete asks for confirmation when the row has a value.

## States

- Loading per scope; empty ("No variables in this scope"); error with retry.
- Dirty/clean grid; saving; server-error.
- Secret values: masked display, reveal on focus while editing.

## Theming

The grid uses the `scoped-env-row` layout (`minmax(150px,1fr) minmax(0,2fr) auto auto`) which collapses to a stacked layout below the `720px` breakpoint. Scope tabs use accent tokens for the active state (`--accent-600` text, `--accent-500` underline). Secret masking is a font/opacity treatment driven by tokens. Save bar surface uses `--color-background-soft` with a top `--color-border`. All themable via token overrides only.
