# ADR-001: Theming and Design Tokens (Tailwind v4 @theme)

- Status: Accepted, **amended 2026-07-30** (see Amendment at the end - the `--agents-accent-*` values below are the fallback branch, not what the live app renders)
- Context: swarmy_ui must be fully re-themeable. A future developer should be able to change every color, radius, shadow, and font in the app without touching a single component.

## Decision

Use Tailwind CSS v4 with all design decisions expressed as CSS custom properties in `@theme` blocks, organized in three token layers. No component may contain a hardcoded hex, oklch, px radius, or font family.

## Token layers

### Layer 1 - Primitive tokens (`tokens.primitives.css`)

Raw scales. Never referenced by components directly.

```css
@theme {
  /* accent (purple brand) */
  --accent-50: #faf5ff;
  --accent-100: #f3e8ff;
  --accent-200: #e9d5ff;
  --accent-300: #d8b4fe;
  --accent-400: #c084fc;
  --accent-500: #a855f7;
  --accent-600: #9333ea;
  --accent-700: #7e22ce;
  --accent-800: #6b21a8;
  --accent-900: #581c87;
  --accent-950: #3b0764;

  /* neutral scale (oklch) */
  --color-neutral-50: oklch(98.5% 0 0);
  --color-neutral-100: oklch(97% 0 0);
  --color-neutral-200: oklch(92.2% 0 0);
  --color-neutral-300: oklch(87% 0 0);
  --color-neutral-400: oklch(70.8% 0 0);
  --color-neutral-500: oklch(55.6% 0 0);
  --color-neutral-600: oklch(43.9% 0 0);
  --color-neutral-700: oklch(37.1% 0 0);
  --color-neutral-800: oklch(26.9% 0 0);
  --color-neutral-900: oklch(20.5% 0 0);
  --color-neutral-950: oklch(14.5% 0 0);

  /* typography */
  --font-sans: "Public Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* spacing base unit 4px, radius scale, shadow scale */
  --spacing: 0.25rem;
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
}
```

### Layer 2 - Semantic tokens (`tokens.semantic.css`)

Meaningful names that map to primitives. Components and utilities reference ONLY these.

```css
@theme {
  --color-text: var(--vt-c-text-light-1);
  --color-background: var(--vt-c-white);
  --color-background-soft: var(--vt-c-white-soft);
  --color-background-mute: var(--vt-c-white-mute);
  --color-border: #d4d4d4;
  --color-border-hover: #a3a3a3;

  /* agent composition accent family - AMENDED: this is the no-color-mix
     FALLBACK branch only. See the Amendment section below for the values
     Chrome actually applies. */
  --agents-accent-surface-hover: var(--accent-500);
  --agents-accent-surface-selected: var(--accent-500);
  --agents-accent-surface-strong: var(--accent-500);
  --agents-accent-surface-message: var(--accent-500);
  --agents-accent-text: #171717;
  --agents-accent-text-muted: var(--accent-700);
  --agents-accent-border: var(--accent-600);
  --agents-accent-ring: var(--accent-500);
}

:root.dark {
  --color-text: var(--vt-c-text-dark-2);
  --color-background: var(--vt-c-black);
  --color-background-soft: var(--vt-c-black-soft);
  --color-background-mute: var(--vt-c-black-mute);
  --color-border: #404040;
  --color-border-hover: #737373;
}
```

### Layer 3 - Component tokens (in the `Ui*` primitives)

Per-primitive aliases, e.g. `--ui-button-bg`, `--ui-badge-fg`. Defined in the primitive's own styles and defaulting to semantic tokens. This is the seam that lets one primitive be reskinned without touching the global theme.

## How to swap themes

1. **New color theme:** create `src/assets/themes/<name>.css` that re-declares Layer 2 semantic tokens (and optionally Layer 1 primitives). Import it instead of (or after) the default. Zero component changes.
2. **Dark mode:** class strategy, `.dark` on `:root`. Toggled by uiStore; persisted in localStorage. All dark values live beside their light counterparts in the semantic layer.
3. **Brand accent change:** edit only the `--accent-*` scale and the `--agents-accent-*` aliases.

## Consequences

- Tailwind generates utilities from the theme (e.g. `bg-background-soft`, `text-agents-accent-text-muted`), so templates stay semantic.
- Arbitrary-value utilities (`text-[10px]`) are allowed only for data-table density cases; never for colors.
- JSON viewer syntax colors are also tokenized (`--json-key`, `--json-string`, ...) with light/dark pairs, so even the code viewer follows the theme.

## Amendment - 2026-07-30 (capture reconciliation, see ADR-009)

The Layer 1 and Layer 2 structure stands. Five values in the original text are
incomplete or wrong against the live app. Nothing above is deleted; this section
is the correction of record.

**1. `--agents-accent-*` needs the `color-mix` branch.** The declarations above
are the fallback. The live app declares them twice, and Chrome applies the
`@supports (color: color-mix(in lab, red, red))` override:

```css
@supports (color: color-mix(in lab, red, red)) {
  :root {
    --agents-accent-surface-hover:    color-mix(in oklab, var(--accent-500)  8%, #fff);  /* #f8f2ff */
    --agents-accent-surface-selected: color-mix(in oklab, var(--accent-500) 18%, #fff);  /* #efe3ff */
    --agents-accent-surface-strong:   color-mix(in oklab, var(--accent-500) 26%, #fff);  /* #e7d6ff */
    --agents-accent-surface-message:  color-mix(in oklab, var(--accent-500) 18%, #fff);  /* #efe3ff */
    --agents-accent-text-muted:       color-mix(in oklab, var(--accent-700) 78%, #171717); /* #6527a2 */
  }
  :root.dark {
    --agents-accent-surface-hover:    color-mix(in oklab, var(--accent-500) 14%, #0a0a0a); /* #1c1525 */
    --agents-accent-surface-selected: color-mix(in oklab, var(--accent-500) 28%, #0a0a0a); /* #302043 */
    --agents-accent-surface-strong:   color-mix(in oklab, var(--accent-500) 36%, #0a0a0a); /* #3c2655 */
    --agents-accent-surface-message:  color-mix(in oklab, var(--accent-500) 28%, #0a0a0a); /* #302043 */
    --agents-accent-text-muted:       color-mix(in oklab, var(--accent-200) 72%, #fafafa); /* #eedffe */
  }
}
```

A selected row is `#efe3ff`, not `#a855f7`. The hex comments are documentation;
never write them into a component.

**2. Accent switching is a third axis.** Theme is `class="dark"` on `<html>`;
accent is `data-accent="<name>"` on `<html>` (absent = purple). Ten ramps ship:
`amber, lime, emerald, sky, blue, indigo, purple (default), fuchsia, pink, white`,
declared as `:root[data-accent="<name>"]`. They are the ten swatches in the
settings popover, and each redefines the full `--accent-50..950` scale.

**3. Body typography.** `body { font-size: 15px; line-height: 24px }` and
`body { transition: color .5s, background-color .5s }`. `body` uses the legacy
Vue-scaffold font stack while everything inside `.app-container` inherits
`--font-sans`. Both start with `Public Sans`. Replicate both stacks.

**4. Shell surfaces.** `.app-container` is `bg-neutral-50/80` over a white body
(dark: `bg-black`, while `body` stays `#181818`). `main` is
`rounded-l-xl border-l border-neutral-200 my-3`. The sidebar `aside` has **no**
background of its own.

**5. Shadows are not tokens in the Tailwind sense.** The theme's shadow scale is
unused. Depth is a painted canvas hatch through the `DropShadow` component
(ADR-009 Decision 2). Layer 2 therefore gains `--dropshadow-color`,
`--dropshadow-color-dark`, `--dropshadow-line-width`, `--dropshadow-pattern` and
the `--elevation-sm/md/lg` triples, and the Tailwind `shadow-*` utilities stay
out of components.
