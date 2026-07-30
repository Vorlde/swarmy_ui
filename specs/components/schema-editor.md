# Component Spec: SchemaEditor

## Purpose

Dual-mode editor for Zod schemas: a `Properties` mode (property tree with typed rows) and a `JSON` mode (Monaco editor with TypeScript syntax highlighting and Zod validation). Used by modals such as ModelModal, PromptModal, and ProviderModal to edit the schema for variable inputs, model parameters, tool configs, and other structured definitions.

## Props

```ts
withDefaults(defineProps<{
  modelValue?: Record<string, unknown> | string; // the Zod schema or its JSON representation (v-model)
  mode?: "properties" | "json";                  // current editor mode, default "properties"
  readonly?: boolean;
}>(), { mode: "properties" });
```

The two modes are labelled **`Properties`** and **`JSON`** in the UI (captured in the Edit Prompt modal's Schema section) - not "Visual" and "Code".

## Emits

- `update:modelValue(schema: Record<string, unknown> | string)` - on every valid edit in either mode
- `update:mode(mode: "properties" | "json")` - user switched editor mode

## Slots

- `toolbar` - extra actions next to the mode tabs

## Behavior

- The mode switch is a pair of **underline tabs** (`Properties` | `JSON`) left-aligned at the top of the section, sitting on a full-width `1px --color-border` baseline. The active tab is accent-coloured text with an accent underline segment; the idle tab is `--color-text` with no underline. It is not a bordered segmented control and it does not sit in a right-hand toolbar.
- Empty schema (captured): a centered block inside the section - a box glyph in `--color-neutral-400`, the muted line `No properties defined`, and a black `+ Add Property` button (`36px` tall, radius `8px`, leading `+` icon) directly beneath it.
- Properties mode edits the Zod schema as a form tree. Each property row (`SchemaPropertyRow`) renders: name (Input), type picker (Select: `string`, `number`, `boolean`, `object`, `array`, `enum`), description (Input), required flag (Switch), and a delete button.
- Object and array rows expand to show nested children, edited recursively with the same row layout.
- Enum rows edit their option list inline as chips: existing options render as removable chips and an input appends new ones.
- An "+ Add Property" button sits at the bottom of the property list (and is the whole empty state when there are no rows) and appends a new row.
- JSON mode mounts a Monaco editor instance with TypeScript language, syntax highlighting, line numbers, and a minimap. Valid edits sync to `modelValue`; invalid text is held locally and reported inline until fixed.
- Validation: the Zod library validates the schema itself. Invalid Zod code surfaces a parse/validation error in an inline error bar and disables the tab back to `Properties` until the code is fixed.
- Switching modes round-trips state: `Properties` edits serialize into Zod code, and valid Zod code parses back into the property tree.
- Rows can be added, renamed, reordered, and deleted; renames preserve the property's position.
- Monaco workers are lazy-loaded; the editor unmounts cleanly and disposes models on unmount.

## Component Usage

`Properties` mode form controls use shadcn-vue components:

- `Input` - property name and description fields
- `Select` - type picker
- `Switch` - required flag
- `Button` - delete row and "+ Add Property" actions
- `Label` - field labels

`JSON` mode uses the Monaco editor (shared Monaco setup with lazy-loaded workers, matching the app's other code surfaces).

## States

- **Loading**: Monaco chunk loading; a skeleton with a spinner fills the JSON pane.
- **Empty**: schema with no properties; `Properties` mode shows the captured empty state (box glyph + `No properties defined` + black `+ Add Property` button), `JSON` mode shows an empty `z.object({})` stub.
- **Error**: invalid Zod code in `JSON` mode; an inline error bar lists the parse/validation message and the tab back to `Properties` is disabled until fixed.
- **Disabled/readonly**: rows render without edit affordances and Monaco is set to `readOnly`.

## Theming / Swappability

All colors, borders, and backgrounds come from the token system; the component contains no hardcoded colors and respects light/dark mode automatically through the tokens.

- Property rows use the standard form-field tokens (`--color-border`, `--color-background`, `--radius-md`).
- The mode tabs are underline tabs: active label `--accent-600` with an `--accent-500` underline on a `--color-border` baseline; idle label `--color-text`. The `+ Add Property` button is the inverted primary (black on white light, white on black dark), not accent-tinted.
- Monaco themes map through the same `--code-theme-light` / `--code-theme-dark` tokens as `UiCodeBlock`, so the editor follows the app theme automatically.
- Enum option chips use the badge tokens (`--color-background-mute`, `--color-text`, `--radius-sm`).

## API Endpoints

None. Schema documents come from and return to the parent form (e.g. prompt or agent save flows).

## Wireframe

`Properties` mode (property list):

```
+--------------------------------------------------------------------------------+
| [ Properties | JSON ]   <- underline tabs on a full-width baseline  (toolbar slot) |
|--------------------------------------------------------------------------------|
| PROPERTIES                                                                + Add Property
| +----+--------------+----------+--------------------------------+------+------+|
| | .. | name*        | string v | The order identifier           | [x]? |  del ||
| +----+--------------+----------+--------------------------------+------+------+|
| | .. | items        | array  v | Line items to review           | [ ]? |  del ||
| |    |  +-------------------------------- nested properties ----------------+ ||
| |    |  | .. | sku*      | string v | Stock keeping unit     | [x]? |  del | ||
| |    |  | .. | qty       | number v | Quantity ordered       | [x]? |  del | ||
| |    |  +-------------------------------------------------------------------+ ||
| +----+--------------+----------+--------------------------------+------+------+|
| | .. | priority     | enum   v | Rush handling level            | [ ]? |  del ||
| |    |  options: [ low ] [ normal ] [ high ]                          [ + ]    ||
| +----+--------------+----------+--------------------------------+------+------+|
+--------------------------------------------------------------------------------+

`JSON` mode (Monaco):

+--------------------------------------------------------------------------------+
| [ Properties | JSON ]   <- underline tabs on a full-width baseline  (toolbar slot) |
|--------------------------------------------------------------------------------|
| +--------------------------------------------------------------+---------------+|
| |  1  import { z } from "zod";                                 |   (minimap)   ||
| |  2                                                           |               ||
| |  3  export const schema = z.object({                         |               ||
| |  4    name: z.string().describe("The order identifier"),     |               ||
| |  5    items: z.array(z.object({                              |               ||
| |  6      sku: z.string(),                                     |               ||
| |  7      qty: z.number(),                                     |               ||
| |  8    })),                                                   |               ||
| |  9    priority: z.enum(["low", "normal", "high"]).optional() |               ||
| | 10  });                                                      |               ||
| +--------------------------------------------------------------+---------------+|
| ! Error bar (JSON mode only): Line 9: Invalid enum value - the Properties tab  |
|   is disabled until the Zod code parses.                                       |
+--------------------------------------------------------------------------------+
```

The tabs sit at the top-left of the section on a full-width baseline; valid edits in either mode sync back to `modelValue`, and switching modes round-trips the schema between the property tree and serialized Zod code.
