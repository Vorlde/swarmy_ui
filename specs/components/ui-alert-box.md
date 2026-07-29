# Component Spec: UiAlertBox

## Purpose

Inline alert for page- and form-level feedback: info notes, success confirmations, warnings, and errors. Optionally dismissible with a persistent-dismiss hook so callers can remember closed alerts.

## Props

```ts
withDefaults(defineProps<{
  variant?: "info" | "success" | "warning" | "error";  // default "info"
  title?: string;                                       // optional bold heading row
  dismissible?: boolean;                                // default false: show close button
  alertId?: string;                                     // stable id, included in dismiss payload
}>(), { variant: "info" });
```

## Emits

- `dismiss(alertId?: string)` - user clicked the close button; the parent hides or persists the dismissal

## Slots

- default - alert body (rich content allowed)
- `icon` - overrides the default per-variant icon
- `actions` - trailing action row (e.g. a ghost `UiButton` link)

## Behavior

- Renders an icon matched to the variant (`Info`, `CheckCircle2`, `AlertTriangle`, `XCircle`) unless the `icon` slot overrides it.
- When `dismissible`, a close button sits top-right; clicking it emits `dismiss` and the component removes itself via an internal `v-if`-friendly `visible` state.
- Uses `role="alert"` for `error` and `warning`, `role="status"` for `info` and `success`.

## States

- **Loading**: n/a.
- **Empty**: renders nothing if there is no slot content and no `title`.
- **Error**: the `error` variant is itself the error presentation.
- **Disabled**: n/a.

## Theming / Swappability

Each variant maps to a semantic token triple: surface `--alert-{variant}-bg`, border `--alert-{variant}-border`, text `--alert-{variant}-text`, with paired dark-mode values (`--color-*-900/30` surfaces in dark). These default to the blue/green/amber/red scales but can be remapped to any brand palette without touching the component. Structure tokens: radius `--radius-lg`, padding `--spacing` 3x4, border width 1px, icon size `--alert-icon-size`. The icon set is swappable through the `icon` slot or the global icon registry.

## API Endpoints

None. Pure presentational component.
