# View Spec: PromptEditView

## Route

- Path: `/prompts/:id`
- Name: `prompt-edit`
- Auth: requires authenticated session

## Purpose

Full editor for a single prompt. A Monaco code editor holds the prompt template content, a side panel manages metadata and template variables, and the view supports save with unsaved-changes protection.

## Layout

App shell with `Sidebar`. Content is a two-column layout: Monaco editor fills the left (flex-grow), a metadata panel sits on the right (fixed width ~320px). A sticky header bar holds the prompt name, dirty indicator, and actions.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        | < Prompts | support-agent        (unsaved)   [Save] [Delete] |
| Side   |+---------------------------------------+--------------------+|
| bar    ||                                       | Metadata           ||
|        ||  You are a helpful support            | Name* [support.. ] ||
|        ||  agent for {{company}}.               | Desc  [textarea..] ||
|        ||                                       |                    ||
|        ||  Answer questions about               | Variables          ||
|        ||  {{topic}} using the docs.            | +----------------+ ||
|        ||                                       | | company  text  | ||
|        ||  [ Monaco editor ]                    | | topic    text  | ||
|        ||                                       | +----------------+ ||
|        ||                                       | [+ Add variable]   ||
|        |+---------------------------------------+--------------------+|
+--------+--------------------------------------------------------------+
```

## Components used

- Monaco editor wrapper (see `docs/adr/adr-003-monaco-editor-integration.md`) - prompt content editing
- `UiButton` - Save/Delete actions
- `ConfirmDialog` - delete and unsaved-changes confirmation
- `UiAlertBox` - save success/error feedback
- `CopyButton` - copy prompt content

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/prompts/:name` | Load prompt content and metadata |
| GET | `/api/prompts/:name/tenvs` | Prompt-scoped env names |
| GET | `/api/variables/prompts/:name` | Resolve variables used in the template |

Save/delete submit through the `/api/prompts/:name` resource path; the view re-fetches after save and navigates back to `/prompts` after delete.

## Interactions

1. On mount: fetch prompt detail, tenvs, and variables in parallel.
2. Monaco language: markdown/plaintext with `{{variable}}` placeholders highlighted by a custom tokenizer.
3. Typing in Monaco sets the dirty flag; the header shows an "(unsaved)" indicator.
4. Route-leave guard: if dirty, show `ConfirmDialog` ("Discard unsaved changes?").
5. "Save" submits content plus metadata; on success clears dirty flag and shows success alert.
6. "Delete" shows `ConfirmDialog`; on confirm, delete and navigate to `/prompts`.
7. Adding a variable inserts a `{{name}}` placeholder at the cursor in Monaco.
8. Variable rows allow rename and delete; renames rewrite matching `{{old}}` placeholders in the content.

## States

- Loading: full-view skeleton.
- Not found: `CenteredContentView` with "Prompt not found" and a back link.
- Dirty/clean editing states; saving (Save button `loading`); save error (inline `UiAlertBox`).

## Theming

Monaco theme is bound to the app theme: register `swarmy-light` and `swarmy-dark` Monaco themes derived from the code/syntax tokens, and switch on the `.dark` class. Editor surface, panel background (`--color-background-soft`), and borders (`--color-border`) are token-driven. Variable badge chips use accent tokens. No component contains a literal color.
