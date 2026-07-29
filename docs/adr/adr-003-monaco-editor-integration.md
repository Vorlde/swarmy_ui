# ADR-003: Monaco Editor Integration (@guolao/vue-monaco-editor)

- Status: Accepted
- Context: swarmy_ui needs a full code editor for prompt template editing, JSON schema editing, and log/response inspection. Monaco is the chosen editor; it must run in Vue 3 with Vite, with workers for JSON, CSS, HTML, and TypeScript languages.

## Decision

Use `@guolao/vue-monaco-editor` (MIT) with explicit Vite `?worker` imports configured in `main.ts`. Do NOT also use a Monaco Vite plugin - pick exactly one worker strategy.

## Setup

```ts
// main.ts
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    const url = (m: string) => new URL(m, import.meta.url).href;
    switch (label) {
      case "json":
        return new Worker(url("monaco-editor/esm/vs/language/json/json.worker?worker"), { type: "module" });
      case "css": case "scss": case "less":
        return new Worker(url("monaco-editor/esm/vs/language/css/css.worker?worker"), { type: "module" });
      case "html": case "handlebars": case "razor":
        return new Worker(url("monaco-editor/esm/vs/language/html/html.worker?worker"), { type: "module" });
      case "typescript": case "javascript":
        return new Worker(url("monaco-editor/esm/vs/language/typescript/ts.worker?worker"), { type: "module" });
      default:
        return new Worker(url("monaco-editor/esm/vs/editor/editor.worker?worker"), { type: "module" });
    }
  },
};
```

```ts
import { loader } from "@guolao/vue-monaco-editor";
import * as monaco from "monaco-editor";
loader.config({ monaco });
```

Editor usage is wrapped in a single app-level component, `CodeEditor.vue`, exposing `modelValue`, `language`, `readOnly`, and `theme` props. All views use `CodeEditor`, never Monaco directly.

## Swappability

- `CodeEditor.vue` is the only Monaco touchpoint. Replacing Monaco with another editor (CodeMirror, etc.) means rewriting one component.
- Monaco's theme is synced with the app theme: the wrapper defines `vs`/`vs-dark`-derived custom themes whose colors come from the token CSS variables, and switches with the `.dark` class.
- Monaco is only imported from editor-reachable route chunks (PromptEditView, PromptModal, JSON editors), keeping it out of the main bundle.

## Alternatives considered

1. **vite-plugin-monaco-editor-esm** - rejected as primary: combining the plugin with manual `MonacoEnvironment` causes worker path errors; manual wiring is more explicit and debuggable.
2. **monaco-editor-vue3** - rejected: smaller community than @guolao; same worker setup required anyway.

## Consequences

- `monaco-editor` (~3.8MB plus workers) is lazy-loaded; first visit to an editor route pays the cost.
- Worker URLs must respect the configurable base path; the `new URL(..., import.meta.url)` pattern handles this automatically.
