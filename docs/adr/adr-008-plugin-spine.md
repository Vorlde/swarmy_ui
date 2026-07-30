# ADR-008: The Plugin Spine - Registration Seams

- Status: Accepted
- Supersedes nothing. Makes ADR-007 (Swappability) operational: ADR-007 says the UI must be replaceable; this ADR says *how a new part gets in* without editing the parts that were already there.

## Context

The replica build has two goals in tension. It must reproduce the captured UI exactly, and it must not hardcode anything merely to look right. The failure mode we are guarding against is concrete and familiar:

- a new view means editing `router/index.ts`,
- a new inspector tab means editing a `v-if` chain and a `tabs` array in `ThreadInspectorPane.vue`,
- a new canvas node kind means editing a `<component :is>` switch in the node layer,
- a new list column means editing a `grid-cols-[...]` string and three cell templates.

Each of those is a core file that every feature has to touch, so features collide and core files accrete conditionals. We want the opposite: core reads a registry, features write to it.

The equally real failure mode is over-correction: a plugin manifest format, a lifecycle, a dependency resolver, a sandbox. We do not need any of that. Everything runs in one bundle, written by one team, in one repo.

## Decision

Four registries, one generic 25-line map behind them, and one auto-loader. A feature registers itself from `src/features/<name>/plug.ts`; that file is discovered automatically, so **adding a feature edits no core file**.

```
src/plugins/registry.ts     createRegistry<T>() + the four typed instances
src/plugins/index.ts        import.meta.glob("../features/*/plug.ts", { eager: true })
src/features/<name>/plug.ts the feature's only contact with core
```

`src/plugins/index.ts` is eager on purpose. A plug must only call `register(...)` with **lazy** component loaders, so loading every plug costs a few hundred bytes of registration calls, not the feature code.

### The four seams

| # | Registry | Key | Value | Consumed by |
|---|---|---|---|---|
| 1 | `views` | view id | `() => import("./FooView.vue")` | `src/router/index.ts` |
| 2 | `inspectorTabs` | tab id | `{ label, icon?, order, component, badge? }` | `ThreadInspectorPane.vue` |
| 3 | `canvasNodes` | `CanvasNode.kind` | `() => import("./FooNode.vue")` | the canvas node layer |
| 4 | `listColumns` | list id | `ListDef` = `{ columns: ColumnDef[], gapX? }` | `DataTable` |

### Seam 1 - routes and views

Route records live in `src/router/routes.ts` as **data**, naming a view id rather than importing a component:

```ts
{ path: "/models", name: "models", view: "models" }
```

The router resolves the id at navigation time:

```ts
component: () => {
  const loader = views.get(def.view);
  return loader ? loader() : Promise.resolve(unregisteredView(def.view));
},
```

Three properties fall out of this. The route table is complete and typechecked before any view exists (this is what closed the 13 TS2307 errors recorded in `PORT-NOTES.md`). A view is code-split for free, because a registry value *is* a dynamic import. And a missing plug fails as one legible in-app message naming the id, not as a build error in `router/index.ts`.

### Seam 2 - inspector tabs

The captured inspector has six tabs (`Logs`, `Files`, `KV Store`, `Effects`, `Agent Configuration`, `Thread Settings`) with a badge on one of them. Ordering is explicit rather than registration-order so two independently-written plugs cannot fight over position:

```ts
inspectorTabs.register("kv-store", {
  label: "KV Store",
  order: 30,
  component: () => import("./ThreadKvStorePane.vue"),
  badge: (threadId) => kvStore.count(threadId),
});
```

`orderedInspectorTabs()` sorts by `order`. The pane renders that list; it has no knowledge of any specific tab.

### Seam 3 - canvas node types

The canvas renders six node kinds today (`agent`, `prompt`, `function`, `subagent`, `human`, `model`). The node layer looks the component up by `node.kind`:

```ts
canvasNodes.register("model", () => import("./ModelNode.vue"));
```

ADR-005 already made node components props-in/events-out. This removes the last coupling: the `v-if`/`switch` that named them.

### Seam 4 - list columns

Lists in this product are CSS grids (ADR-009), which means the column set and the grid track list are the same information. Writing them separately guarantees they drift, so `ColumnDef` carries its track and the template is derived:

```ts
listColumns.register("agents", {
  gapX: 16,
  columns: [
    { key: "avatar",  track: "36px" },                       // no label: chrome column
    { key: "title",   track: "1fr",  label: "Title",   sortable: true },
    { key: "threads", track: "72px", label: "Threads", sortable: true },
    { key: "type",    track: "80px", label: "Type",    sortable: true },
    { key: "sides",   track: "1fr",  label: "Sides" },
    { key: "actions", track: "32px" },
  ],
});
// gridTemplate(def) === "36px 1fr 72px 80px 1fr 32px"
```

That is exactly the captured `grid-cols-[36px_1fr_72px_80px_1fr_32px]`, but as data. Adding, reordering or resizing a column is a data edit in a plug.

### Cascade sections

The `/agents` cascade is a fifth candidate seam and is deliberately **not** a registry yet. It has two known members (`/agents` shows Agents + Thread workspace + Structure, `/threads` shows the last two) and a registry would be speculation. `CompositionView` renders an ordered array of section descriptors declared in one place, which is the shape a registry would take if a third arrangement ever appears. Promote it then, not now.

## How a future feature adds a plug

1. `mkdir src/features/metrics`
2. Write the components.
3. Write `src/features/metrics/plug.ts`:

```ts
import { views, inspectorTabs, listColumns } from "@/plugins";

views.register("metrics", () => import("./MetricsView.vue"));
inspectorTabs.register("metrics", {
  label: "Metrics",
  order: 45,
  component: () => import("./ThreadMetricsPane.vue"),
});
listColumns.register("metrics", { gapX: 16, columns: [/* ... */] });
```

4. If it needs a route, add one line to `src/router/routes.ts`.

Steps 1-3 touch no core file. Step 4 touches a route *table*, which is data and merge-friendly; a nested or modal route needs no core change at all.

## Rules

1. Core never imports a feature. If `src/router`, `src/components/ui`, or a shell component names a feature module, the seam is wrong.
2. A plug registers; it does not run. No fetching, no store mutation, no side effects at module scope beyond `register` calls.
3. Registry values that are components are always lazy loaders.
4. Ordering is explicit (`order: number`), never registration order.
5. A registry is added only when there are at least two real members and a third is plausible. Four is the current count and we are not looking for a fifth.

## Consequences

- One indirection between "route exists" and "component exists". The `unregisteredView(id)` diagnostic makes that visible rather than mysterious.
- `import.meta.glob` is Vite-specific. If the bundler ever changes, `src/plugins/index.ts` becomes an explicit list of imports - a ten-line file, and the only casualty.
- Registration is untyped by key (`string` ids). Deliberate: typing the keys would require a central union that every feature edits, which is the coupling this ADR removes. Wrong ids surface as the missing-plug diagnostic.
- Duplicate registration warns in dev and last-wins, which is also the override mechanism: a theme or fork can replace `ModelNode` by registering the same key later.
