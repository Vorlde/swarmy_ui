# swarmy_ui - Design System Reference

The visual language of swarmy_ui in one document. Every value here resolves through design tokens (CSS custom properties). Components never contain literal colors, radii, or font stacks; a component with a hardcoded value is a bug.

Token layers (Tailwind v4 `@theme` blocks):

1. **Primitives** (`tokens.primitives.css`) - raw scales.
2. **Semantic** (`tokens.semantic.css`) - meaning (text, background, border, accent family). Dark values live beside light values under `:root.dark`.
3. **Component** (inside each `Ui*` primitive) - per-widget aliases defaulting to semantic tokens.

Components only ever consume semantic utilities (`bg-background-soft`, `text-agents-accent-text-muted`, `border-border`).

---

## 1. Color palette

### 1.1 Accent ramp (brand purple)

The brand accent. Drives primary buttons, selected states, focus rings, badges, canvas selection, and filter chips through the `--agents-accent-*` aliases.

| Token | Value |
|---|---|
| `--accent-50` | `#faf5ff` |
| `--accent-100` | `#f3e8ff` |
| `--accent-200` | `#e9d5ff` |
| `--accent-300` | `#d8b4fe` |
| `--accent-400` | `#c084fc` |
| `--accent-500` | `#a855f7` |
| `--accent-600` | `#9333ea` |
| `--accent-700` | `#7e22ce` |
| `--accent-800` | `#6b21a8` |
| `--accent-900` | `#581c87` |
| `--accent-950` | `#3b0764` |

### 1.2 Neutral ramp (oklch grays)

| Token | Value |
|---|---|
| `--color-neutral-50` | `oklch(98.5% 0 0)` |
| `--color-neutral-100` | `oklch(97% 0 0)` |
| `--color-neutral-200` | `oklch(92.2% 0 0)` |
| `--color-neutral-300` | `oklch(87% 0 0)` |
| `--color-neutral-400` | `oklch(70.8% 0 0)` |
| `--color-neutral-500` | `oklch(55.6% 0 0)` |
| `--color-neutral-600` | `oklch(43.9% 0 0)` |
| `--color-neutral-700` | `oklch(37.1% 0 0)` |
| `--color-neutral-800` | `oklch(26.9% 0 0)` |
| `--color-neutral-900` | `oklch(20.5% 0 0)` |
| `--color-neutral-950` | `oklch(14.5% 0 0)` |

The full Tailwind color set (red, orange, amber, yellow, green, emerald, sky, blue, violet - 256 semantic `--color-*` vars total) is available for status/feedback semantics.

### 1.3 Semantic surfaces (light / dark)

| Token | Light | Dark (`:root.dark`) |
|---|---|---|
| `--color-text` | `var(--vt-c-text-light-1)` | `var(--vt-c-text-dark-2)` |
| `--color-background` | `var(--vt-c-white)` | `var(--vt-c-black)` |
| `--color-background-soft` | `var(--vt-c-white-soft)` | `var(--vt-c-black-soft)` |
| `--color-background-mute` | `var(--vt-c-white-mute)` | `var(--vt-c-black-mute)` |
| `--color-border` | `#d4d4d4` | `#404040` |
| `--color-border-hover` | `#a3a3a3` | `#737373` |

Surface hierarchy: `background` (app stage) -> `background-soft` (cards, modals, table surfaces) -> `background-mute` (table header rows, inset regions, hover fills).

### 1.4 Composition accent family

Semantic aliases used by agent-related selection and messaging surfaces. All default to the accent ramp; re-pointing these re-skins every selected row, active tab, canvas node, and assistant bubble at once.

| Token | Default |
|---|---|
| `--agents-accent-surface-hover` | `var(--accent-500)` |
| `--agents-accent-surface-selected` | `var(--accent-500)` |
| `--agents-accent-surface-strong` | `var(--accent-500)` |
| `--agents-accent-surface-message` | `var(--accent-500)` |
| `--agents-accent-text` | `#171717` |
| `--agents-accent-text-muted` | `var(--accent-700)` |
| `--agents-accent-border` | `var(--accent-600)` |
| `--agents-accent-ring` | `var(--accent-500)` |

### 1.5 Status semantics

| Meaning | Scale used | Example consumers |
|---|---|---|
| Success | emerald tokens | `configured` provider badge |
| Warning | amber tokens | `missing key` badge, one-time key warning copy |
| Danger | red tokens | delete actions, `error` badges, `hasError` tools |
| Info | blue/sky tokens | JSON number values, info alerts |

### 1.6 JSON syntax colors (JsonViewer)

| Element | Light | Dark |
|---|---|---|
| punctuation | `#27272a` | `#e4e4e7` |
| key | `var(--accent-600)` | `var(--accent-400)` |
| string | `#71717a` | `#a1a1aa` |
| number | `#2563eb` | `#60a5fa` |
| boolean | `#d97706` | `#fbbf24` |
| null | `#a1a1aa` | `#52525b` |

Exposed as the `--json-key/string/number/boolean/null` token pairs so a theme re-skins every payload display without touching components.

---

## 2. Typography

### 2.1 Families

| Token | Value | Use |
|---|---|---|
| `--font-sans` | `"Public Sans", ui-sans-serif, system-ui, sans-serif, ...` | All UI text |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, ...` | Thread ids, keys, code, JSON, cost figures, variable placeholders |

Public Sans is loaded via Google Fonts in weights 100-900 plus italics.

### 2.2 Weights

| Token | Value | Typical use |
|---|---|---|
| `--font-weight-normal` | 400 | Body, table cells |
| `--font-weight-medium` | 500 | Labels, nav items |
| `--font-weight-semibold` | 600 | Titles, modal headers, table headers |
| `--font-weight-bold` | 700 | Emphasis, hero numbers |

### 2.3 Size scale

| Utility | Role |
|---|---|
| `text-xs` | Badges, metadata, pills |
| `text-sm` | Body default, table cells, form inputs |
| `text-base` | Emphasized body, composer text |
| `text-lg` | Card titles, modal headers |
| `text-xl` | View titles |
| `text-2xl` | Page-level hero headers |
| `text-3xl` | Rare; marketing-scale empty states |

Micro sizes `text-[10px]` and `text-[11px]` appear in dense data-table metadata cells; prefer `text-xs` for new work.

### 2.4 Line height and rhythm

Line heights follow the Tailwind defaults paired to each size utility. Body copy in prose containers (`.marketplace-readme`) inherits the typography tokens with comfortable reading rhythm; UI chrome stays tight (single-line labels, two-line clamp on descriptions).

---

## 3. Spacing scale

Base unit: `--spacing: 0.25rem` (4px). All padding, gaps, and margins are integer multiples of this unit.

| Step | Value | Typical use |
|---|---|---|
| 0 | 0 | Reset |
| 1 | 4px | Icon-to-label gaps, inline chip padding |
| 2 | 8px | Compact gaps, badge padding |
| 3 | 12px | Cell padding (`px-3`), input horizontal padding |
| 4 | 16px | Card padding (`p-4`), section gaps |
| 5 | 20px | Loose card padding |
| 6 | 24px | View-level padding (`p-6`) |
| 7 | 28px | Section separation |
| 8 | 32px | Large section gaps (`p-8`) |
| 9 | 36px | Rare layout gaps |
| 10 | 40px | Empty-state spacing |
| 11 | 44px | Rare |
| 12 | 48px | Page section breaks |
| 14 | 56px | Hero spacing |
| 16 | 64px | Major layout separation |
| 28 | 112px | Exceptional layout offsets |

Half steps in active use: `py-1.5` (6px) for compact control vertical padding.

Density contract: a compact theme changes `--spacing` once and every row height, cell padding, and card inset tightens together.

---

## 4. Border radius scale

| Token | Value | Utility | Use |
|---|---|---|---|
| `--radius-xs` | 0.125rem (2px) | `rounded-xs` | Tiny chips, focus rings on small elements |
| `--radius-sm` | 0.25rem (4px) | `rounded-sm` | Badges, small inputs |
| `--radius-md` | 0.375rem (6px) | `rounded`/`rounded-md` | Buttons, inputs, menu items |
| `--radius-lg` | 0.5rem (8px) | `rounded-lg` | Cards, table containers, dropdown panels |
| `--radius-xl` | 0.75rem (12px) | `rounded-xl` | Modal cards |
| `--radius-2xl` | 1rem (16px) | `rounded-2xl` | Large surfaces, empty-state cards |
| - | - | `rounded-full` | Pills, avatar dots, status indicators |

---

## 5. Shadow / elevation scale

| Level | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px 0 #0000000d` | Resting inputs, subtle separators |
| `shadow-sm` | `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a` | Cards at rest, table containers |
| `shadow-md` | `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` | Card hover (marketplace cards raise sm -> md) |
| `shadow-lg` | `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` | Dropdown panels, popovers |
| `shadow-xl` | `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a` | Modal cards, the highest elevation in the app |

Elevation rule: at most three levels visible per screen (resting surface, raised hover, overlay). Overlays always use `shadow-xl`.

---

## 6. Component state matrix

States: **default, hover, active, focus, disabled, loading, error**. All color references are semantic tokens.

### 6.1 Buttons (`UiButton`: `primary`, `ghost`, `danger`)

| State | primary | ghost | danger |
|---|---|---|---|
| Default | bg `--agents-accent-surface-strong`, text on-accent | transparent bg, text `--color-text` | bg red scale, white text |
| Hover | accent hover surface (lighten/darken via accent step) | fill `--color-background-mute` | red scale step up |
| Active (pressed) | accent step darker | `--color-background-mute` + scale-95 | red step darker |
| Focus visible | ring `--agents-accent-ring` (2px, offset) | same ring | same ring |
| Disabled | opacity 50%, no pointer events | same | same |
| Loading | spinner inline, label kept, disabled | same | same |
| Error | n/a (buttons do not own errors; the surrounding form shows `UiAlertBox`) | - | - |

Sizes follow the spacing scale (`px-3 py-2` default, `py-1.5` compact); radius `--radius-md`.

### 6.2 Inputs (`TextInput`, `SelectInput`, form fields via `UiFormField`)

| State | Treatment |
|---|---|
| Default | bg `--color-background-soft`, border `--color-border`, radius `--radius-md`, text `--color-text` |
| Hover | border `--color-border-hover` |
| Active | same as focus |
| Focus visible | ring `--agents-accent-ring`, border accent |
| Disabled | muted bg, 60% opacity, no pointer events |
| Loading | disabled + field-level spinner (async option fetches) |
| Error | border red scale, `UiErrorText` below the field, `UiAlertBox` for form-level failures |

Label/help/error chrome comes from `UiLabel`, `UiHelpText`, `UiErrorText` inside `UiFormField`.

### 6.3 Cards (view cards, marketplace cards, node cards)

| State | Treatment |
|---|---|
| Default | bg `--color-background-soft`, border `--color-border`, radius `--radius-lg`, `shadow-sm` |
| Hover | marketplace cards raise to `shadow-md`; agent table cards show a hover ring |
| Active (selected) | ring/border `--agents-accent-ring`, surface `--agents-accent-surface-selected` tint |
| Focus visible | ring `--agents-accent-ring` when the card is a click target |
| Disabled | dimmed, non-interactive (flagged nav/config states) |
| Loading | skeleton blocks inside the card frame |
| Error | `UiAlertBox` inside the card region, surface unchanged |

### 6.4 Table rows (`DataTable`)

| State | Treatment |
|---|---|
| Default | dividers `--color-border`, cells `--color-text` on `--color-background-soft` |
| Hover | bg tint from `--color-border-hover`; clickable rows show pointer cursor + hover ring |
| Active (selected / deep-linked) | bg `--agents-accent-surface-selected`, text `--agents-accent-text` |
| Focus visible | row-level focus ring for keyboard navigation |
| Disabled | dimmed row, actions hidden via `visible` callbacks |
| Loading | skeleton rows (the whole table shows skeletons while `loading`) |
| Error | row-level danger badge (e.g. `hasError` tools); table-level failures use `UiAlertBox` above the table |

Header row sits on `--color-background-mute` with semibold labels; sortable headers show direction glyphs.

---

## 7. Iconography

- Icon set: `lucide-vue-next` glyphs throughout. No custom icon font.
- Icons inherit `currentColor`; color always follows the surrounding text token, never a literal fill.
- Sizes align to the spacing scale (16px default inline, 20px in buttons, 14px in dense metadata).
- Status dots are simple filled circles (`rounded-full`) colored by the status semantic scales.
- Provider icons are server-provided images (`GET /api/providers/:name/icon`) and are exempt from theming.
- Every icon-only control is a `UiIconButton` with a `title`/`UiTooltip`; never a bare glyph.
- The brand logo is injected via the sidebar `logo` slot or the `--logo-url-light` / `--logo-url-dark` tokens.

---

## 8. Motion / animation tokens

| Token / value | Use |
|---|---|
| `300ms` transition | Sidebar width (`w-16` <-> `w-60`) collapse/expand |
| `--sidebar-cascade-delay` | Stagger step for nav item cascade entrance (`--cascade-index` per item) |
| `inspector-slide-up-*` classes | Thread inspector pane entrance |
| Default ease | Tailwind default (`cubic-bezier(0.4, 0, 0.2, 1)`) for color/background transitions |
| 150-200ms | Hover color, border, and shadow transitions on interactive elements |

Motion principles:

- Transitions are short and functional: state feedback, not decoration.
- Entrances cascade only in the sidebar nav; everything else appears instantly or with a simple fade/slide.
- Spinners (`Loader`) are the only looping animation.
- Respect `prefers-reduced-motion`: cascade and slide effects degrade to instant.

---

## 9. Dark mode strategy

- **Mechanism:** class strategy. `.dark` on `<html>`, toggled by `uiStore`, persisted to localStorage.
- **Token layout:** dark values live beside light values in the semantic layer under `:root.dark`. There is no separate dark stylesheet, so nothing drifts out of sync.
- **Paired utilities:** templates use pairs like `dark:text-neutral-400`, `dark:border-neutral-700`, `dark:bg-black/80` where the semantic layer needs a component-level counterpart.
- **Independent pieces:** the favicon SVG follows `prefers-color-scheme` on its own. Monaco registers `swarmy-light` / `swarmy-dark` themes derived from the syntax tokens and switches on the `.dark` class. Code blocks use the theme's Shiki highlight pair.
- **Rule:** no view contains view-specific dark code; dark mode is a token-layer concern only.

---

## 10. Theme swappability contract

A **theme pack** is a single CSS file (e.g. `src/assets/themes/my-theme.css`) imported after the defaults. It must provide:

1. **Primitive overrides** (as needed): the `--accent-*` ramp, neutral ramp adjustments, `--font-sans`, `--font-mono`, `--spacing` density, `--radius-*`, shadow scale.
2. **Semantic values, light and dark:** `--color-text`, `--color-background{,-soft,-mute}`, `--color-border{,-hover}` under `:root` and `:root.dark`.
3. **The composition accent family:** all eight `--agents-accent-*` aliases in both modes.
4. **JSON token pairs:** `--json-key/string/number/boolean/null` light + dark.
5. **Code display:** a Shiki highlight pair and a Monaco theme mapping so editors and code blocks follow the theme.
6. **Optional hooks:** sidebar tokens (`--sidebar-hover-bg`, `--sidebar-active-bg`, `--sidebar-width`, `--sidebar-width-collapsed`, `--sidebar-cascade-delay`), logo tokens (`--logo-url-light`, `--logo-url-dark`), eyebrow tracking (`--tracking-eyebrow`).

Guarantees a conforming theme pack gets for free:

- Every button, selected row, canvas edge, ring, badge, and tab indicator follows the accent family.
- Dark mode works with zero component changes.
- Spacing density, radius, and elevation change globally from the primitive scale.
- Modals, tables, forms, and JSON viewers restyle because they only consume semantic/component tokens.

What a theme pack must NOT do: restyle individual components by class override, or change any store, route, API, or domain behavior. Appearance is the skin; functionality (API contract, stores, domain models, streaming flows) is the core, and the core never imports from the skin. For the full manifesto see `docs/design/theming.md`.
