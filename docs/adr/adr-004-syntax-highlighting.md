# ADR-004: Syntax Highlighting with Shiki (fine-grained createHighlighterCore)

- Status: Accepted
- Context: Static code display (code blocks in messages, log payloads, JSON viewer-adjacent previews, prompt previews) needs accurate syntax highlighting with light/dark themes. Highlighting happens repeatedly in streaming contexts, so per-call highlighter creation is too expensive.

## Decision

Use Shiki v3 fine-grained bundle: `createHighlighterCore` from `shiki/core` with explicit `@shikijs/langs/*` and `@shikijs/themes/*` imports, wrapped in a singleton composable `useShikiHighlighter`.

## Implementation

```ts
// lib/shiki/highlighter.ts
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let promise: Promise<HighlighterCore> | null = null;

export function getHighlighter() {
  promise ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [
      () => import("@shikijs/langs/json"),
      () => import("@shikijs/langs/markdown"),
      () => import("@shikijs/langs/typescript"),
      () => import("@shikijs/langs/bash"),
      () => import("@shikijs/langs/yaml"),
      () => import("@shikijs/langs/python"),
    ],
    themes: [
      () => import("@shikijs/themes/github-light"),
      () => import("@shikijs/themes/github-dark"),
    ],
  });
  return promise;
}
```

- One highlighter for the whole app lifetime (module-level cached promise).
- Only the languages the product actually displays are bundled; everything else tree-shaken away.
- The JS regex engine avoids the WASM/oniguruma payload.
- `UiCodeBlock` and `CodeBlock` call `highlighter.codeToHtml(code, { lang, theme })` and render with `v-html`. Theme name follows the `.dark` class (`github-light` / `github-dark`).

## Swappability

- All highlighting goes through `useShikiHighlighter` and the two code-block components. Changing the highlight engine or the theme pair touches one file.
- Highlight theme is part of the theme system: a custom theme declares its Shiki theme pair next to its token file.

## Alternatives considered

1. **Shiki shorthand `codeToHtml`** - rejected as primary: fine for one-shot highlights, but repeated streaming renders benefit from the singleton.
2. **vue-markdown-shiki wrapper** - rejected: only needed if rendering full markdown documents; the app highlights snippets, not documents.
3. **Prism/highlight.js** - rejected: less accurate grammars, weaker theme fidelity vs Monaco-adjacent display.

## Consequences

- `shiki` plus per-lang/theme packages are dependencies; lazy chunk reachable only from code-display components.
- `v-html` output is Shiki-generated (trusted, escaped by Shiki), but code content from the API must still never be injected outside the highlighter path.
