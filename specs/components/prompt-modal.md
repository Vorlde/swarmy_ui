# Component Spec: PromptModal

## Purpose

Create/edit dialog for prompt templates. Manages the prompt name, template content with `{{variable}}` placeholders, detected/declared variables, and metadata such as description and tags. Body sections adapt between stacked and side-by-side layouts via container queries.

## Props

```ts
withDefaults(defineProps<{
  modelValue: boolean;                // v-model: open state
  editPrompt?: PromptEntry | null;    // existing record for edit mode
  mode?: "add" | "edit";              // default "add"
  readonly?: boolean;
  saving?: boolean;
}>(), { mode: "add" });
```

## Emits

- `update:modelValue(value: boolean)`
- `save(payload: PromptEntryPayload)` - validated prompt submitted; parent owns the request

## Slots

- default - not used (form body is internal)
- `footer` - overrides the default Cancel/Save action row

## Behavior

- Built on `Modal` with unsaved-changes guarding (`hasChanges`).
- The body uses `edit-sections-query` / `edit-sections-stack` container-query classes: wide layouts show content and variables side by side, narrow layouts stack them.
- The content field is a multiline editor that live-scans for `{{variable}}` placeholders; newly detected variables appear in the variables panel, and removed ones are flagged before being dropped.
- Each declared variable row has a name, type, optional default, and description; undeclared-but-used and declared-but-unused variables both surface as warnings.
- Edit mode hydrates from `editPrompt`, including its variable declarations and metadata.
- Save validates name (required, unique per namespace) and content (non-empty), then emits `save`; the parent performs the request and closes on success.

## States

- **Loading**: existing prompt fetching in edit mode; `saving` blocks the footer.
- **Empty**: content empty; save is disabled and a hint explains the placeholder syntax.
- **Error**: load failures and server-side validation errors render in an `UiAlertBox` above the form.
- **Disabled/readonly**: inputs disabled, footer save hidden.

## Theming / Swappability

Inherits `Modal` theming; section panes use `--color-background-soft` with `--color-border` separators and `--radius-lg`. The variable-detected highlight uses `--accent-100`/`--accent-700` (dark: `--accent-900`/`--accent-300`) so accent remapping recolors detection UI. The container-query breakpoints (`500px` card, `modal-card-footer` stack) are CSS-level and adjustable per theme without touching script. Placeholder chips in the content editor use the `--font-mono` token.

## API Endpoints

- `GET /api/prompts` - name-collision checks
- `GET /api/prompts/:name` - hydrate edit mode
- `GET /api/variables/prompts/:name` - declared variables for an existing prompt
- Save is delegated to the parent (`POST /api/prompts`, `PUT /api/prompts/:id`).

## Wireframe

Wide layout (side-by-side sections via container query):

```
+--------------------------------------------------------------------------------+
| EDIT PROMPT: risk_analyst                                                  [x] |
|--------------------------------------------------------------------------------|
| (UiAlertBox: load / validation errors)                                         |
|                                                                                |
| Name *        [ risk_analyst              ]                                    |
| Description   [ Reviews an order for fraud risk ]                              |
| Tags          [ fraud ] [ review ] [ + ]                                       |
|---------------------------------------+----------------------------------------|
| CONTENT                               | VARIABLES (live-detected)              |
| +-----------------------------------+ | +------------------------------------+ |
| | You are a risk analyst.           | | | orderId*  [string v]  def: [-]     | |
| | Review order {{orderId}} for      | | | customer_tier [string v] def: ["s"]| |
| | tier {{customer_tier}} ...        | | +------------------------------------+ |
| |                                   | | ! used but undeclared: region        |
| +-----------------------------------+ | ! declared but unused: (none)        |
+---------------------------------------+----------------------------------------|
|                                                       [Cancel]  [Save]         |
+--------------------------------------------------------------------------------+

Narrow layout (stacked):

+--------------------------------------+
| ADD PROMPT                       [x] |
|--------------------------------------|
| Name *        [                  ]   |
|--------------------------------------|
| CONTENT                              |
| +----------------------------------+ |
| | (multiline editor; {{var}} chips | |
| |  highlighted as you type)        | |
| +----------------------------------+ |
|--------------------------------------|
| VARIABLES                            |
|  + orderId    [string v]             |
|  + customer_tier [string v]          |
|--------------------------------------|
| [Cancel]                             |
| [Save]                               |
+--------------------------------------+
```

Empty content disables Save and shows the `{{variable}}` syntax hint. Removed placeholders are flagged in the variables panel before being dropped.
