# Component Spec: SchemaEditor

## Purpose

Dual-mode editor for Zod schemas: a visual mode (property tree with typed rows) and a code mode (Monaco editor with TypeScript syntax highlighting and Zod validation). Used by modals such as ModelModal, PromptModal, and ProviderModal to edit the schema for variable inputs, model parameters, tool configs, and other structured definitions.

## Props

```ts
withDefaults(defineProps<{
  modelValue?: Record<string, unknown> | string; // the Zod schema or its JSON representation (v-model)
  mode?: "visual" | "code";                      // current editor mode, default "visual"
  readonly?: boolean;
}>(), { mode: "visual" });
```

## Emits

- `update:modelValue(schema: Record<string, unknown> | string)` - on every valid edit in either mode
- `update:mode(mode: "visual" | "code")` - user switched editor mode

## Slots

- `toolbar` - extra actions next to the mode toggle in the top toolbar

## Behavior

- Visual mode edits the Zod schema as a form tree. Each property row (`SchemaPropertyRow`) renders: name (Input), type picker (Select: `string`, `number`, `boolean`, `object`, `array`, `enum`), description (Input), required flag (Switch), and a delete button.
- Object and array rows expand to show nested children, edited recursively with the same row layout.
- Enum rows edit their option list inline as chips: existing options render as removable chips and an input appends new ones.
- An "Add property" button sits at the bottom of the property list and appends a new row.
- Code mode mounts a Monaco editor instance with TypeScript language, syntax highlighting, line numbers, and a minimap. Valid edits sync to `modelValue`; invalid text is held locally and reported inline until fixed.
- Validation: the Zod library validates the schema itself. Invalid Zod code surfaces a parse/validation error in an inline error bar and disables the toggle back to Visual mode until the code is fixed.
- Switching modes round-trips state: visual edits serialize into Zod code, and valid Zod code parses back into the visual tree.
- Rows can be added, renamed, reordered, and deleted; renames preserve the property's position.
- Monaco workers are lazy-loaded; the editor unmounts cleanly and disposes models on unmount.

## Component Usage

Visual mode form controls use shadcn-vue components:

- `Input` - property name and description fields
- `Select` - type picker
- `Switch` - required flag
- `Button` - delete row and "Add property" actions
- `Label` - field labels

Code mode uses the Monaco editor (shared Monaco setup with lazy-loaded workers, matching the app's other code surfaces).

## States

- **Loading**: Monaco chunk loading; a skeleton with a spinner fills the code pane.
- **Empty**: schema with no properties; visual mode shows an "Add property" empty state, code mode shows an empty `z.object({})` stub.
- **Error**: invalid Zod code in code mode; an inline error bar lists the parse/validation message and the mode toggle back to Visual is disabled until fixed.
- **Disabled/readonly**: rows render without edit affordances and Monaco is set to `readOnly`.

## Theming / Swappability

All colors, borders, and backgrounds come from the token system; the component contains no hardcoded colors and respects light/dark mode automatically through the tokens.

- Visual rows use the standard form-field tokens (`--color-border`, `--color-background-soft`, `--radius-md`).
- The mode toggle uses the accent tokens for its active segment (`--accent-500` ring and surface).
- Monaco themes map through the same `--code-theme-light` / `--code-theme-dark` tokens as `UiCodeBlock`, so the editor follows the app theme automatically.
- Enum option chips use the badge tokens (`--color-background-mute`, `--color-text`, `--radius-sm`).

## API Endpoints

None. Schema documents come from and return to the parent form (e.g. prompt or agent save flows).

## Wireframe

Visual mode (property list):

```
+--------------------------------------------------------------------------------+
| Zod Schema                                [ Visual | JSON ]   (toolbar slot)   |
|--------------------------------------------------------------------------------|
| PROPERTIES                                                                  + Add property
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

Code mode (Monaco):

+--------------------------------------------------------------------------------+
| Zod Schema                                [ Visual | JSON ]   (toolbar slot)   |
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
| ! Error bar (code mode only): Line 9: Invalid enum value - toggle to Visual    |
|   is disabled until the Zod code parses.                                       |
+--------------------------------------------------------------------------------+
```

The mode toggle sits in the toolbar; valid edits in either mode sync back to `modelValue`, and switching modes round-trips the schema between the visual tree and serialized Zod code.
