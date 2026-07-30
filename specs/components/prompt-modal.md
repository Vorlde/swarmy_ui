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

- Built on `Modal` with unsaved-changes guarding (`hasChanges`). The same surface serves `/prompts/:id` (see `views/prompt-edit-view.md`), so its captured structure is authoritative here.
- Header (`60px`): title `Edit Prompt` / `Add Prompt` bold on the left, `X` icon-button on the right. There is no uppercase eyebrow line.
- Directly under the header sits a **section-pill strip** (`44px`, `bg --color-neutral-100`, `1px --color-border` bottom rule): `Basics` | `Schema` | `Prompt` | `Tools` | `Hooks` | `Variables` | `Behavior`, each `icon + label`. Active pill = solid black fill / white label at `--radius-md`; idle = transparent; hover/pressed = light neutral fill. The pills scroll-spy and scroll-into-view over one long stack - they do **not** swap panes.
- The body is a single vertical stack of bordered section cards (padding `20px`, `~20px` gaps), in the pill order above. Wide/narrow is a change in section-card internals only; there is no two-pane "content beside variables" layout.
- The `Prompt` section holds a plain textarea plus the helper line `Type @ to insert schema properties, env variables, or other prompts.`; the `Schema` section embeds `SchemaEditor` (`Properties` | `JSON` tabs); the `Tools` section is a tab row `Functions` / `Sub-prompts` / `Handoffs` / `Sub-agents` with count badges.
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

Inherits `Modal` theming, including the near-opaque white scrim and the `DropShadow` hatch elevation (`offsetX`/`offsetY` `6`, `pattern: "diagonal"`) - never a `box-shadow`.

Section cards use `--color-background` with `--color-border` separators and `--radius-lg`; the pill strip uses `--color-neutral-100` / `--color-neutral-900`. The active pill and the `+ Add Property` button are the **inverted** primary (black on white light, white on black dark), so remapping the accent ramp does not recolor them. Underline tabs inside sections (`Properties`/`JSON`, the Tools tabs) are the accent surface: `--accent-600` text with an `--accent-500` underline. The variable-detected highlight uses `--accent-100`/`--accent-700` (dark: `--accent-900`/`--accent-300`). The container-query breakpoints (`500px` card, `modal-card-footer` stack) are CSS-level and adjustable per theme without touching script. Placeholder chips, model ids, and inline path chips use the `--font-mono` token.

## API Endpoints

- `GET /api/prompts` - name-collision checks
- `GET /api/prompts/:name` - hydrate edit mode
- `GET /api/variables/prompts/:name` - declared variables for an existing prompt
- Save is delegated to the parent (`POST /api/prompts`, `PUT /api/prompts/:id`).

## Wireframe

As captured (`~1016px` card, `~85vh` tall, centered, DropShadow hatch on the right/bottom):

```
+--------------------------------------------------------------------------+#
| Edit Prompt                                                          [x] |#
|--------------------------------------------------------------------------|#
| [(] Basics] [{} Schema] [Prompt] [Tools] [Hooks] [Variables] [Behavior]   |#   <- pill strip, active = black
|--------------------------------------------------------------------------|#
| +----------------------------------------------------------------------+ |#
| | (=) Basics                                                           | |#
| |----------------------------------------------------------------------| |#
| | Prompt Name (i)   [ customer_advocate                              ] | |#
| | Tool Description (i) [ Argues the customer side against a risk ... ] | |#
| | Model (i)  [ (o) default [OPENROUTER]   VIS TOOL / STR JSON  x  v  ] | |#
| +----------------------------------------------------------------------+ |#
| +----------------------------------------------------------------------+ |#
| | {} Schema      [ Properties | JSON ]                                 | |#
| |            (box glyph)  No properties defined   [ + Add Property ]   | |#
| +----------------------------------------------------------------------+ |#
| +--- Prompt ----+ +--- Tools ---+ +--- Hooks ---+ +- Variables -+ +- Behavior -+ (stacked, one per row)
+--------------------------------------------------------------------------+#
 ############################################################################
```

The body is one scroll container; the pills scroll a section into view. Empty content disables Save and shows the `Type @ ...` hint. Removed placeholders are flagged in the Variables section before being dropped.
