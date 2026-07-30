# Component Spec: DataTable (the list-grid primitive)

## Purpose

Reusable list primitive for every tabular surface in the app. Provides a header (title, description, primary action), client-side search, column sorting, row actions with optional confirmation, bulk actions, expandable rows, and empty/loading states.

## Grids, not tables (load-bearing)

The capture settles this. **Lists in this product render as CSS grids, not `<table>` elements.** The one real `<table>` in the whole app is the inspector's log list (`LogsTable`, see `specs/views/thread-inspector-view.md`). Everything else - the Agents list, the Threads list, and the settings/CRUD lists - is a `display: grid` with an explicit column track list, which is what lets a row span its full width, keep a 36px avatar column pinned, and animate hover across the whole row.

Measured from `exact-tokens.md` 3.3 (Agents list):

```
grid-cols-[36px_1fr_72px_80px_1fr_32px]  gap-x-4   /* 16px */
```

Two header variants exist and they are easy to conflate. Both are supported by this component through `headerStyle`:

| `headerStyle` | Used by | Style |
|---|---|---|
| `"plain"` *(default)* | Agents list, Threads list - the cascade columns | `text-[11px]`, `font-weight 600`, `letter-spacing: normal`, `text-transform: none`, color `#a1a1a1` (`text-neutral-400`, dark `text-neutral-500`), `padding 8px 20px` (`px-5 py-2`), `border-bottom 1px solid #d4d4d4`, row height 35px. **Not uppercase, not tracked.** |
| `"caps"` | Settings / CRUD lists (`/prompts`, `/models`, `/tools`, `/providers`, `/settings/*`) | uppercase, `tracking-wider`, ~11px, `text-neutral-500`, on the card's header band. Sort chevrons sit to the right of the label. |

For reference, the third and genuinely different style is the inspector log `<table>`'s `th`: `px-4 py-2 font-medium`, 10px / 500 / letter-spacing 0.25px per `exact-tokens.md` 3.5. Do not apply it here.

Row metrics for the cascade lists: `px-5 py-3` (`12px 20px`), `text-[13px]` with `line-height 20.8px`, row height **66px**, transparent background, `transition-colors .15s cubic-bezier(.4,0,.2,1)`. Hover is `.agents-surface-hover:hover` = `#f8f2ff` light / `#1c1525` dark. Selected is `.agents-surface-selected` = `#efe3ff` light / `#302043` dark plus `.agents-border-selected` (`#9333ea` light / `#c084fc` dark) - never a flat `#a855f7`.

## Props

```ts
interface Column {
  key: string;
  /** Omitted for chrome columns with no header text: avatar, kebab. */
  label?: string;
  /**
   * CSS grid track for this column: "36px", "1fr", "72px", "32px".
   * The container's grid-template-columns is derived by joining these, so the
   * column set is the single source of truth for the layout - a view never
   * writes a grid-cols-[...] string by hand.
   */
  track: string;
  /** @deprecated superseded by `track`; kept only while views migrate. */
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterIcon?: (value: unknown, row: Record<string, unknown>) => string;
  searchable?: boolean;
  formatter?: (value: unknown, row: Record<string, unknown>) => string | number;
  html?: boolean;
  align?: "left" | "center" | "right";
  cellClass?: string | ((row: Record<string, unknown>) => string);
  visible?: boolean | ((row: Record<string, unknown>) => boolean);
}

interface Action {
  icon?: string;
  label: string;
  variant?: "danger";
  confirm?: boolean;
  confirmMessage?: string | ((row: Record<string, unknown>) => string);
  disabled?: boolean | ((row: Record<string, unknown>) => boolean);
  visible?: boolean | ((row: Record<string, unknown>) => boolean);
  handler: (row: Record<string, unknown>) => void | Promise<void>;
}

interface PrimaryAction { label: string; icon?: unknown; handler: () => void }

interface BulkAction {
  icon?: unknown;
  label: string;
  variant?: "danger";
  confirm?: boolean;
  confirmMessage?: string;
  handler: (rows: Record<string, unknown>[]) => void | Promise<void>;
}

defineProps<{
  columns: Column[];
  data: Record<string, unknown>[];
  actions?: Action[];
  bulkActions?: BulkAction[];
  primaryAction?: PrimaryAction;
  title?: string;
  description?: string;
  emptyMessage?: string;
  loading?: boolean;
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  expandable?: boolean;
  /** Header typography variant; see "Grids, not tables" above. */
  headerStyle?: "plain" | "caps";
  /** Horizontal grid gap in px. 16 (gap-x-4) in the captured lists. */
  gapX?: number;
}>();
```

## Emits

- `update:sortKey(key: string)`
- `update:sortDirection(dir: "asc" | "desc")`
- `search(query: string)` - debounced through `SearchInputWrapper`
- `row-click(row: Record<string, unknown>)`
- `selection-change(rows: Record<string, unknown>[])`

## Slots

- `cell-<key>` - custom cell rendering per column (slot props: `{ value, row }`)
- `expanded` - expanded row content (slot props: `{ row }`)
- `empty` - custom empty state
- `header-actions` - extra buttons next to the primary action

## Behavior

- The container renders `display: grid` with `grid-template-columns` computed from `columns.map(c => c.track)`. Header and rows are separate grids with the identical template, so columns stay aligned without a `<table>`.
- Column sets are registered, not inlined: a list id resolves to a `ListDef` through the `listColumns` registry (`src/plugins/registry.ts`, ADR-008). A feature adds or reorders columns from its plug; this component is never edited to add a column.
- Actions with `confirm: true` open an internal `ConfirmDialog` before running `handler`.
- The trailing row-actions column is a 32px track holding a kebab (`...`) button. In the cascade lists it opens a menu positioned `absolute right-0 top-8 z-30 min-w-[160px] origin-top-right rounded-lg border` (measured 160x129) with `Edit / Pack / Delete`.
- Sorting and search operate client-side on the given `data`; parents re-fetch if server-side paging is needed.
- `loading` renders skeleton rows; empty data renders `emptyMessage` with an inbox icon.

## States

Loading, empty, populated, single-selection, multi-selection (bulk action bar visible), expanded row, confirm-pending.

## Theming / Swappability

Header text uses `--color-text` with muted description at 60% opacity tokens. List surface is `#ffffff` (`--color-background`) inside a `rounded-xl` 1px `--color-border` (`#d4d4d4` light / `#404040` dark) card; the page behind it is `bg-neutral-50/80`. Row dividers `--color-border`; hover and selection come from the `--agents-accent-*` family (`--agents-accent-surface-hover`, `--agents-accent-surface-selected`, `--agents-accent-border`), so the interaction tint is accent-derived, not grey. Sort icons and action icons are `lucide-vue-next` glyphs inheriting currentColor, so icon color follows text tokens. Danger actions use red scale tokens. All spacing uses the 4px spacing scale; radius `--radius-lg` on the container. A full reskin (borders, surfaces, accent) is achievable by overriding tokens only.

## Wireframe

CRUD list (`headerStyle="caps"`, e.g. `/prompts`) - populated state with selection, sorting, bulk actions:

```
+--------------------------------------------------------------------------------+
| Models                                   [header-actions]  [+ Add model]       |
| Manage the model catalog used by agents.                                       |
|--------------------------------------------------------------------------------|
| [search....................]            2 selected: [Delete] [Export]          |
|--------------------------------------------------------------------------------|
| [x] | NAME       v | PROVIDER      | CONTEXT  | COST /1M    | ACTIONS          |
|-----|--------------|---------------|----------|-------------|------------------|
| [x] | default      | openrouter    | 1,048,576| $0.09-1.00  | [edit] [del]     |
| [x] | fast-chat    | openai        |   128,000| $0.15/0.60  | [edit] [del]     |
| [ ] | vision-pro   | anthropic     |   200,000| $3.00/15.00 | [edit] [del]     |
|-----|--------------|---------------|----------|-------------|------------------|
|  v  | (expandable row content renders inline under the row)                    |
+--------------------------------------------------------------------------------+

Empty state:                                     Loading state:
+--------------------------------------------+   +--------------------------------------------+
|              [inbox icon]                  |   | |######################################|  |
|        No models yet.                      |   | |######################################|  |
|   Create one with + Add model.             |   | |######################################|  |
+--------------------------------------------+   +--------------------------------------------+
                                                  (skeleton rows)
```

Cascade list (`headerStyle="plain"`, Agents column, `grid-cols-[36px_1fr_72px_80px_1fr_32px] gap-x-4`):

```
| 36px |        1fr        | 72px  | 80px |        1fr         | 32px |
|      | Title           ^ | Threads ^ | Type ^ | Sides        |      |   <- 11px/600, NOT caps
|------|-------------------|-------|------|--------------------|------|
| [av] | fraud_review_agent| [] 2  |Dual AI| A risk_analyst    |  ... |   <- 66px row
|      |                   |       |      | B customer_advocate|      |
```

Notes: sortable column headers show a direction glyph; actions with `confirm: true` open an internal ConfirmDialog before running; danger actions render in red scale tokens; the bulk action bar only appears while `selection-change` rows exist.
