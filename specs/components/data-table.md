# Component Spec: DataTable

## Purpose

Reusable data table for all list/CRUD views. Provides a header (title, description, primary action), client-side search, column sorting, row actions with optional confirmation, bulk actions, expandable rows, and empty/loading states.

## Props

```ts
interface Column {
  key: string;
  label: string;
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

- Actions with `confirm: true` open an internal `ConfirmDialog` before running `handler`.
- Sorting and search operate client-side on the given `data`; parents re-fetch if server-side paging is needed.
- `loading` renders skeleton rows; empty data renders `emptyMessage` with an inbox icon.

## States

Loading, empty, populated, single-selection, multi-selection (bulk action bar visible), expanded row, confirm-pending.

## Theming / Swappability

Header text uses `--color-text` with muted description at 60% opacity tokens. Table surface `--color-background-soft`, header row `--color-background-mute`, row dividers `--color-border`, hover `--color-border-hover` tinted background. Sort icons and action icons are `lucide-vue-next` glyphs inheriting currentColor, so icon color follows text tokens. Danger actions use red scale tokens. All spacing uses the 4px spacing scale; radius `--radius-lg` on the container. A full reskin (borders, surfaces, accent) is achievable by overriding tokens only.

## Wireframe

Populated state (with selection, sorting, bulk actions):

```
+--------------------------------------------------------------------------------+
| Models                                   [header-actions]  [+ Add model]       |
| Manage the model catalog used by agents.                                       |
|--------------------------------------------------------------------------------|
| [search....................]            2 selected: [Delete] [Export]          |
|--------------------------------------------------------------------------------|
| [x] | Name       v | Provider      | Context  | Cost /1M    | Actions          |
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

Notes: sortable column headers show a direction glyph; actions with `confirm: true` open an internal ConfirmDialog before running; danger actions render in red scale tokens; the bulk action bar only appears while `selection-change` rows exist.
