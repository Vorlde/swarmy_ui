# View Spec: PromptsView

## Route

- Path: `/prompts`
- Name: `prompts`
- Auth: requires authenticated session

## Purpose

The prompt library. Lists all reusable prompts with their descriptions and variable counts, and provides entry points to create a prompt (via `PromptModal`) or open the full editor (`/prompts/:id`).

## Layout

App shell with `Sidebar`. Content area is a `DataTable` of prompts. Row click navigates to the prompt editor. A primary action opens `PromptModal` for quick create.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Prompts                                  [+ New Prompt]     |
|        |  Reusable prompt templates for your agents.                  |
| Side   |  [Search prompts...                           ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name              | Variables | Updated    | Actions     | |
|        | |-------------------+-----------+------------+-------------| |
|        | | support-agent     | 3         | 2024-05-01 | Edit Del    | |
|        | | refund-policy     | 1         | 2024-04-28 | Edit Del    | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

## Components used

- `DataTable` - prompt list
- `PromptModal` - quick create/edit of prompt metadata
- `ConfirmDialog` - delete confirmation
- `UiButton`, `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/prompts` | List prompts |
| GET | `/api/prompts/:name` | Detail (used by editor view and modal prefill) |
| GET | `/api/prompts/:name/tenvs` | Prompt-scoped env/variable names |
| GET | `/api/variables/prompts/:name` | Variables referenced by the prompt template |

## Interactions

1. On mount: fetch `/api/prompts`.
2. Search filters by name.
3. Row click navigates to `/prompts/:name` (PromptEditView).
4. "+ New Prompt" opens `PromptModal`; on save, navigate to the new prompt's editor.
5. Row "Edit" opens `PromptModal` prefilled (metadata only; content editing happens in PromptEditView).
6. Row "Delete" uses `ConfirmDialog`; on confirm, delete and re-fetch.

## States

- Loading, empty ("No prompts yet. Create your first prompt."), error with retry.
- Modal: idle, saving, server-error.

## Theming

Fully token-driven: table and modal inherit the shared surface/border/text tokens. The variable-count badge uses `--accent-100`/`--accent-700` tokens. Row hover uses `--color-background-mute`. No hardcoded colors anywhere; dark mode via the `.dark` class.
