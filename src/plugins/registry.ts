// Plugin spine - the four registration seams. See docs/adr/adr-008-plugin-spine.md.
//
// Core code reads these registries; it never imports a feature. A feature
// registers itself from `src/features/<name>/plug.ts`, which is auto-loaded by
// `src/plugins/index.ts`. Adding a feature therefore edits no core file.
//
// This is a registration seam, not a framework: one 25-line generic map plus
// four typed instances.
import type { Component } from "vue";

export interface Registry<T> {
  register(id: string, value: T): void;
  get(id: string): T | undefined;
  has(id: string): boolean;
  ids(): string[];
  entries(): Array<[string, T]>;
}

export function createRegistry<T>(label: string): Registry<T> {
  const items = new Map<string, T>();
  return {
    register(id, value) {
      if (items.has(id) && import.meta.env.DEV) {
        console.warn(`[${label}] "${id}" registered twice; the later plug wins.`);
      }
      items.set(id, value);
    },
    get: (id) => items.get(id),
    has: (id) => items.has(id),
    ids: () => [...items.keys()],
    entries: () => [...items.entries()],
  };
}

/** A lazily-loaded component, as produced by `() => import("./Foo.vue")`. */
export type ComponentLoader = () => Promise<{ default: Component }>;

// -- Seam 1: views ---------------------------------------------------------
// Route records live in `src/router/routes.ts` as data and name a view id.
// The router resolves that id here, so routes exist before their views do.
export const views = createRegistry<ComponentLoader>("view");

// -- Seam 2: inspector tabs ------------------------------------------------
// The thread inspector renders whatever is registered, ordered by `order`.
export interface InspectorTabDef {
  label: string;
  icon?: Component;
  order: number;
  component: ComponentLoader;
  /** Optional count rendered in the tab pill (KV Store shows `1` in the capture). */
  badge?: (threadId: string) => number | undefined;
}
export const inspectorTabs = createRegistry<InspectorTabDef>("inspector-tab");

export function orderedInspectorTabs(): Array<[string, InspectorTabDef]> {
  return inspectorTabs.entries().sort((a, b) => a[1].order - b[1].order);
}

// -- Seam 3: canvas node types ---------------------------------------------
// Keyed by `CanvasNode.kind`. The canvas node layer looks the component up
// instead of running a v-if chain, so a new node kind is a new plug.
export const canvasNodes = createRegistry<ComponentLoader>("canvas-node");

// -- Seam 4: list column sets ----------------------------------------------
// Lists in this product are CSS grids, not tables (see ADR-009). A column def
// therefore carries its grid track, and the grid template is derived from the
// column set rather than written out by hand.
export interface ColumnDef<Row = Record<string, unknown>> {
  key: string;
  /** Omitted for chrome columns that have no header text (avatar, kebab). */
  label?: string;
  /** CSS grid track for this column, e.g. `36px`, `1fr`, `72px`. */
  track: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  /** Cell renderer; falls back to the raw value when absent. */
  cell?: Component;
  visible?: (row: Row) => boolean;
}

export interface ListDef<Row = Record<string, unknown>> {
  columns: Array<ColumnDef<Row>>;
  /** Tailwind gap-x utility value in px; the agents/threads grids use 16. */
  gapX?: number;
}

export const listColumns = createRegistry<ListDef>("list-columns");

export function gridTemplate(def: ListDef): string {
  return def.columns.map((c) => c.track).join(" ");
}
