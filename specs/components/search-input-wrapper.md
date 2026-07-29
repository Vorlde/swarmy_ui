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

Structure classes come from the shared form-field class tokens (`outer`, `inner`, `input`, `prefixIcon`, `suffixIcon`), all resolving to `--color-border`, `--color-background-soft`, `--radius-lg`, and `--color-text`. Icon color follows `--color-neutral-400` with `--color-neutral-600` hover (dark pairs included). Focus ring uses `--accent-500`. Debounce timing and icons are configurable per instance, so a theme can restyle or re-icon every search field without touching the component logic.

## API Endpoints

None. Search semantics belong to the caller (e.g. a list view querying its own endpoint on `search`).
