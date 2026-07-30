# Component Spec: SearchInputWrapper

## Purpose

Search text field with a leading search icon, a clear button that appears when the field has a value, and debounced emission so lists and API queries do not fire on every keystroke. Ships with a custom shadcn-vue component wrapper so VeeValidate-driven forms can drop it in via `<Field>` or `useField`.

## Props

```ts
withDefaults(defineProps<{
  modelValue?: string;        // v-model
  placeholder?: string;       // default "Search..."
  debounce?: number;          // ms, default 300; 0 emits synchronously
  disabled?: boolean;
  autofocus?: boolean;
}>(), { placeholder: "Search...", debounce: 300 });

// VeeValidate usage: <Field name="search" :component="SearchInputWrapper" /> or useField("search")
```

## Emits

- `update:modelValue(value: string)` - debounced value change
- `search(value: string)` - debounced, fired only when the value actually changed
- `clear()` - clear button clicked (also emits `update:modelValue` with `""`)

## Slots

- `prefix-icon` - overrides the leading search icon
- `suffix-icon` - overrides the clear button icon

## Behavior

- Typing updates the visible value immediately but debounces the `search`/`update:modelValue` emissions; each keystroke resets the timer.
- The clear button renders only when the current value is non-empty; clicking it resets the field and emits immediately without waiting for the debounce.
- `data-prefix-icon` / `data-suffix-icon` attributes reflect icon presence for external styling hooks.
- Pending debounce timers are cancelled on unmount to avoid late emissions.
- In VeeValidate mode the wrapper binds through `useField` (`modelValue` synced to the field value, `handleChange` on input) and resolves placeholder/disabled from field attrs with fallbacks.

## States

- **Loading**: none internally; callers may show a spinner via the `suffix-icon` slot while results fetch.
- **Empty**: value empty; clear button hidden, placeholder visible.
- **Error**: validation messages render below the field in VeeValidate mode via `Field`'s message rendering (Zod schema errors).
- **Disabled**: input disabled, icons dimmed, clear button hidden.

## Theming / Swappability

Structure classes come from the shared form-field class tokens (`outer`, `inner`, `input`, `prefixIcon`, `suffixIcon`), all resolving to `--color-border`, `--color-background`, `--radius-lg`, and `--color-text`. Icon color follows `--color-neutral-400` with `--color-neutral-600` hover (dark pairs included). Focus ring uses `--accent-500`. Debounce timing and icons are configurable per instance, so a theme can restyle or re-icon every search field without touching the component logic.

Measured on the page-level list views (`prompts-1512-light.png`, `models-1512-light.png`, `providers-1512-light.png`, `tools-1512-light.png`), viewport 1512, CSS px:

| Property | Measured | Token |
|---|---|---|
| Size | `448 x 38` (width is the caller's layout) | height = the `md` field-height token |
| Border | `1px solid #d4d4d4` (dark `#404040`) | `--color-border` |
| Radius | `8px` | `--radius-lg` |
| Surface | `#ffffff` | `--color-background` (**not** `-soft`) |
| Placeholder + leading magnifier | `#a1a1a1` | `--color-neutral-400` |

Adjacent selects in the same filter row (`All Models`, `All Providers`) are `220x38` with a `12px` gap and share this chrome. `/marketplace` is the exception: its sort control is a **native `<select>`**, so it renders the platform chevron rather than the shared suffix glyph.

Note: this is a *different* size preset from the agents-composition search box recorded in `exact-tokens.md` §3.4 (`34px` tall, `padding 6px 12px`, `font-size 14px`). Both resolve through the same tokens; only the preset differs.

## API Endpoints

None. Search semantics belong to the caller (e.g. a list view querying its own endpoint on `search`).
