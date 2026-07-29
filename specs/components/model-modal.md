# Component Spec: ModelModal

## Purpose

Create/edit dialog for model entries. Collects the model name, provider, model ID, token limits, generation parameters, and capability flags, and supports an inline (non-modal) rendering for embedding in side panes.

## Props

```ts
withDefaults(defineProps<{
  modelValue: boolean;                 // v-model: open state (ignored when inline)
  editModel?: ModelEntry | null;       // existing record for edit mode
  mode?: "add" | "edit";               // default "add"
  readonly?: boolean;                  // inspect-only rendering
  saving?: boolean;                    // parent-driven save spinner
  inline?: boolean;                    // render as embedded panel instead of Modal
}>(), { mode: "add", readonly: false, saving: false, inline: false });
```

## Emits

- `update:modelValue(value: boolean)`
- `save(payload: ModelEntryPayload)` - validated form submitted; parent owns the request

## Slots

- `header-extra` - trailing content in the header row
- default - not used (form body is internal)

## Behavior

- Built on `Modal` (unless `inline`), with `hasChanges` guarding so closing a dirty form asks for confirmation.
- Header shows an eyebrow label ("ADD MODEL" / "EDIT MODEL" / "MODEL") plus the model name when editing.
- Form fields (shadcn-vue + VeeValidate, Zod schema validation): provider shadcn-vue `Combobox` (searchable, required), model ID `Input`, `max_context_tokens` and `max_output_tokens` `NumberField` inputs with step 1000, generation parameters (temperature, top_p, etc.), and capability `Checkbox` fields (streaming, tools, vision, JSON mode). Form state is managed with VeeValidate `useForm`.
- Opening in edit mode hydrates all fields from `editModel`; switching `editModel` while open re-hydrates.
- On open it fetches the provider/capability option lists; options cache for the session.
- Save validates required fields, then emits `save`; the parent performs the create/update request and closes the modal on success. `saving` drives the footer button spinner.
- `readonly` disables every input and hides the save action.

## States

- **Loading**: option lists fetching (field-level spinners); `saving` blocks the footer.
- **Empty**: providers list empty; provider field shows an empty-state hint.
- **Error**: option fetch or validation failures surface in an `UiAlertBox` at the top of the body.
- **Disabled/readonly**: all inputs disabled, footer save hidden.

## Theming / Swappability

Inherits `Modal` theming (surface `--color-background-soft`, radius `--radius-xl`, `--color-border` dividers). The eyebrow label uses `--color-neutral-400` with letter-spacing token `--tracking-eyebrow`. Field chrome comes from the shared form-field token set, and the footer action row uses standard `UiButton` variants, so a theme swap restyles the whole dialog. Width is the `max-w-*` class prop on `Modal` and can be restyled per deployment.

## API Endpoints

- `GET /api/models` - list used to detect name collisions and hydrate edit mode
- `GET /api/models/available` - provider/model options for the autocomplete
- `GET /api/models/capabilities` - capability flag options
- `GET /api/models/endpoints` - provider endpoint metadata shown as help text
- Save itself is delegated to the parent (`POST/PUT /api/models/:id`).

## Wireframe

Modal mode (add; edit mode shows "EDIT MODEL" eyebrow + model name):

```
+--------------------------------------------------------------+
| ADD MODEL                          [header-extra]        [x] |
|--------------------------------------------------------------|
| (UiAlertBox: error banner, shown only on failure)            |
|                                                              |
| Provider *   [ autocomplete: search providers...      v]     |
| Model ID     [ deepseek-v4-flash                       ]     |
|                                                              |
| Max context tokens    [ 1,048,576 ]   (step 1000)            |
| Max output tokens     [   393,216 ]   (step 1000)            |
|                                                              |
| Generation parameters                                        |
|   Temperature [ 0.7 ]   Top P [ 1.0 ]   ...                  |
|                                                              |
| Capabilities                                                 |
|   [x] Streaming   [x] Tools   [ ] Vision   [x] JSON mode     |
|--------------------------------------------------------------|
|                                  [Cancel]  [Save (spinner)]  |
+--------------------------------------------------------------+

Inline mode (inline: true, embedded in a side pane instead of Modal):

+-----------------------------------+
| MODEL                             |
|-----------------------------------|
| (same fields, no backdrop /       |
|  header close / footer shell)     |
|   ...                             |
|                 [Save]            |
+-----------------------------------+
```

Readonly mode renders all inputs disabled and hides the Save action. Option lists (providers, capabilities) show field-level spinners while fetching.
