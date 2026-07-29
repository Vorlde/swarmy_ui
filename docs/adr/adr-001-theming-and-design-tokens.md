# ADR-001: Theming and Design Tokens (Tailwind v4 @theme)

- Status: Accepted
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

  /* agent composition accent family */
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
