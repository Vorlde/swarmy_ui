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

Each variant maps to a semantic token triple: surface `--alert-{variant}-bg`, border `--alert-{variant}-border`, text `--alert-{variant}-text`, with paired dark-mode values. These can be remapped to any brand palette without touching the component.

Defaults, measured from the capture (viewport 1512, CSS px):

| Variant | Surface | Border | Icon / text | Seen in |
|---|---|---|---|---|
| `info` | `#fafafa` (`--color-neutral-50`) - **neutral, not blue** | `1px #d4d4d4` (`--color-border`) | circled-`i` in `#a1a1a1` (`--color-neutral-400`); title line in `--color-text`, second line muted | `tools-1512-light.png` ("To create or modify tools, edit the `agents/tools/` directory of your codebase." / "Changes will be automatically detected.") |
| `error` | `#fef2f2` (red-50) | `1px` red-200 family | circled-`X` in the red-500 family; message in the red-600/700 family | `settings-my-variables-1512-light.png` ("Super admin sessions do not have per-user env storage. Use instance envs or sign in as a user account.") |
| `success` / `warning` | emerald-50 / amber-50 pairs | matching `-200` | matching `-500` icon, `-700` text | not exercised in the capture |

Structure tokens as measured: radius `~12px` (`--radius-xl`), border width `1px`, padding `~16px 20px`, alert stretches the full content width, icon size `--alert-icon-size` (`~20px`) in a fixed leading column with a `~16px` gap. The body supports a bold first line plus a muted second line, and inline mono chips (`UiCodeBlock` inline mode) for paths.

The alert carries **no** `box-shadow`. The icon set is swappable through the `icon` slot or the global icon registry.

## API Endpoints

None. Pure presentational component.
