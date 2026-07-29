# ADR-006: State Management - Reactive Stores, No Framework

- Status: Accepted
- Context: swarmy_ui has medium-complexity shared state: auth session, catalogs (agents, models, prompts, tools, providers, hooks), threads with live streaming, and UI state (theme, panes, modal stack). We evaluated Pinia and plain reactive modules.

## Decision

Hand-rolled reactive stores: plain TypeScript modules using Vue's `reactive`, `computed`, and `toRefs`. No Pinia, no Vuex.

## Pattern

```ts
// src/stores/models.ts
import { reactive, computed } from "vue";
import { api } from "@/lib/api";

const state = reactive({
  models: [] as ModelSummary[],
  loading: false,
  error: null as ApiError | null,
});

export const modelsStore = {
  state,
  models: computed(() => state.models),
  byName: computed(() => new Map(state.models.map((m) => [m.name, m]))),

  async load() {
    state.loading = true;
    state.error = null;
    try {
      state.models = (await api.models.list()).models;
    } catch (e) {
      state.error = e as ApiError;
    } finally {
      state.loading = false;
    }
  },
};
```

## Rules

1. One module per domain: `auth`, `agents`, `threads`, `models`, `catalogs`, `marketplace`, `users`, `variables`, `ui`.
2. Only stores call the API client and WS manager. Components call store actions and read store state.
3. Cross-store reads allowed one-way: feature stores -> `authStore` / `uiStore`. Never the reverse.
4. State that is local to one component (form drafts, hover state) stays in the component. Stores are only for shared or cross-route state.
5. Streaming subscriptions are owned by stores (subscribe on select, unsubscribe on deselect); the WS manager closes sockets with no subscribers.

## Why not Pinia

- The app needs ~9 stores with straightforward CRUD + stream logic; Pinia's devtools, plugins, and SSR hydration are unused overhead.
- Plain modules are more portable: the store layer is valid TypeScript with no framework-specific API surface beyond `reactive`, which also makes the data layer easier to lift into a different UI shell (swappability).
- Testing is simpler: stores are plain objects with async methods; no store factory or app injection needed.

## Consequences

- No time-travel devtools. Mitigated by keeping store mutations inside named actions and logging in dev mode.
- HMR of stores must be handled manually (accept and re-attach state in dev only).
- If the team later adopts Pinia, each module maps mechanically to a `defineStore` setup store; the action/state split is already in place.
