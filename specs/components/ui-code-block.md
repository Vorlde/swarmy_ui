# Component Spec: UiCodeBlock

## Purpose

Displays code with syntax highlighting, either inline within prose or as a standalone block. Highlighting is done with Shiki via `createHighlighterCore` so only the grammars and themes actually used are bundled, keeping the initial payload small.

## Props

```ts
withDefaults(defineProps<{
  code?: string;              // source to highlight; falls back to default slot text
  lang?: string;              // Shiki grammar id ("ts", "json", "bash", ...), default "text"
  inline?: boolean;           // default true: render <code>, else <pre> block
  showLineNumbers?: boolean;  // block mode only, default false
  theme?: string;             // override Shiki theme name; defaults to the active app theme pair
}>(), { inline: true, lang: "text" });
```

## Emits

- `loaded()` - the highlighter finished async initialization and highlighted output is on screen
- `error(message: string)` - grammar load or highlight failure

## Slots

- default - raw code text, used when `code` prop is not provided

## Behavior

- The shared highlighter is created lazily with `createHighlighterCore` and cached module-wide; subsequent instances highlight synchronously from the cache.
- Languages are registered on demand: an unknown `lang` triggers a dynamic grammar load, then a re-highlight.
- Inline mode renders a single `<code>` element with no Shiki pass (plain mono styling) to avoid overhead in prose.
- Block mode renders `<pre>` with horizontal overflow scrolling and optional line numbers via CSS counters.
- Until the async highlighter resolves, the raw text is shown unhighlighted so content is never blocked.

## States

- **Loading**: highlighter initializing; raw mono text shown, then swapped to highlighted output.
- **Empty**: no `code` and no slot content; renders nothing.
- **Error**: unknown grammar with failed load; falls back to unhighlighted text and emits `error`.
- **Disabled**: n/a.

## Theming / Swappability

The component does not hardcode colors. It maps the app theme to a Shiki theme pair (light/dark) through the `--code-theme-light` / `--code-theme-dark` tokens and switches with the `.dark` root class, so changing the token pair rethemes every code block at once. Chrome styling is token-driven: surface `--color-background-mute`, radius `--radius-sm` inline / `--radius-md` block, font `--font-mono` at `text-xs`, inline padding via `--spacing`. Line-number gutter color uses `--color-neutral-400`.

## API Endpoints

None. Grammar/theme assets ship with the bundle; no network calls.
