<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { Inbox, ChevronDown, ChevronUp, Edit, Trash2, Eye, Search } from "lucide-vue-next";
import ConfirmDialog from "./ConfirmDialog.vue";
import UiButton from "./UiButton.vue";

export interface Column {
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

export interface Action {
  icon?: string;
  label: string;
  variant?: "danger";
  confirm?: boolean;
  confirmMessage?: string | ((row: Record<string, unknown>) => string);
  disabled?: boolean | ((row: Record<string, unknown>) => boolean);
  visible?: boolean | ((row: Record<string, unknown>) => boolean);
  handler: (row: Record<string, unknown>) => void | Promise<void>;
}

export interface PrimaryAction {
  label: string;
  icon?: unknown;
  handler: () => void;
}

export interface BulkAction {
  icon?: unknown;
  label: string;
  variant?: "danger";
  confirm?: boolean;
  confirmMessage?: string;
  handler: (rows: Record<string, unknown>[]) => void | Promise<void>;
}

const props = withDefaults(defineProps<{
  columns: Column[];
  data: Record<string, unknown>[];
  actions?: Action[];
  emptyMessage?: string;
  loading?: boolean;
  title?: string;
  description?: string;
  primaryAction?: PrimaryAction;
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  searchable?: boolean;
  searchQuery?: string;
  searchPlaceholder?: string;
  paginated?: boolean;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  selectedRows?: Record<string, unknown>[];
  rowKey?: string;
  bulkActions?: BulkAction[];
}>(), {
  emptyMessage: "No data available",
  loading: false,
  sortable: false,
  sortDirection: "asc",
  searchable: false,
  searchQuery: "",
  searchPlaceholder: "Search...",
  paginated: false,
  page: 1,
  pageSize: 10,
  totalItems: 0,
  pageSizeOptions: () => [10, 25, 50, 100],
  selectable: false,
  selectedRows: () => [],
  rowKey: "id",
  bulkActions: () => [],
});

const emit = defineEmits<{
  (e: "update:sortKey", value: string): void;
  (e: "update:sortDirection", value: "asc" | "desc"): void;
  (e: "sort", payload: { key: string; direction: "asc" | "desc" }): void;
  (e: "update:searchQuery", value: string): void;
  (e: "search", value: string): void;
  (e: "update:page", value: number): void;
  (e: "update:pageSize", value: number): void;
  (e: "page-change", value: number): void;
  (e: "update:selectedRows", value: Record<string, unknown>[]): void;
  (e: "selection-change", value: Record<string, unknown>[]): void;
  (e: "row-click", row: Record<string, unknown>): void;
}>();

function getValue(row: Record<string, unknown>, key: string) {
  return row[key];
}

function formatCell(row: Record<string, unknown>, column: Column) {
  const value = getValue(row, column.key);
  if (column.formatter) return column.formatter(value, row);
  return value ?? "-";
}

function buildFilterOptions(columns: Column[], data: Record<string, unknown>[]) {
  return columns.filter((c) => c.filterable).map((column) => {
    const map = new Map<string, { value: string; label: string; icon?: string }>();
    for (const row of data) {
      const value = getValue(row, column.key);
      if (value == null) continue;
      const display = column.formatter ? String(column.formatter(value, row)) : String(value);
      if (!map.has(display)) {
        map.set(display, { value: display, label: display, icon: column.filterIcon?.(value, row) });
      }
    }
    return {
      key: column.key,
      label: column.label,
      options: Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([_, opt]) => opt),
    };
  });
}

function filterData(
  data: Record<string, unknown>[],
  columns: Column[],
  filters: Record<string, string>,
  query: string,
  searchable: boolean
) {
  let result = data;
  const filterEntries = Object.entries(filters).filter(([_, v]) => v !== "");
  if (filterEntries.length > 0) {
    result = result.filter((row) => filterEntries.every(([key, value]) => {
      const column = columns.find((c) => c.key === key);
      if (!column) return true;
      const cellValue = getValue(row, key);
      if (cellValue == null) return false;
      const display = column.formatter ? String(column.formatter(cellValue, row)) : String(cellValue);
      return display === value;
    }));
  }
  if (!searchable || !query.trim()) return result;
  const lower = query.toLowerCase().trim();
  return result.filter((row) => columns.some((column) => {
    if (column.searchable === false) return false;
    const value = getValue(row, column.key);
    if (value == null) return false;
    const display = column.formatter ? String(column.formatter(value, row)) : String(value);
    return display.toLowerCase().includes(lower);
  }));
}

function sortData(data: Record<string, unknown>[], key: string | undefined, direction: "asc" | "desc") {
  if (!key) return data;
  return [...data].sort((a, b) => {
    const aValue = getValue(a, key);
    const bValue = getValue(b, key);
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? 1 : -1;
    if (bValue == null) return direction === "asc" ? -1 : 1;
    let cmp = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      cmp = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      cmp = aValue - bValue;
    } else {
      cmp = String(aValue).localeCompare(String(bValue));
    }
    return direction === "asc" ? cmp : -cmp;
  });
}

function isRowSelected(row: Record<string, unknown>) {
  return props.selectedRows.some((r) => getValue(r, props.rowKey) === getValue(row, props.rowKey));
}

function toggleRow(row: Record<string, unknown>) {
  const selected = isRowSelected(row);
  const next = selected
    ? props.selectedRows.filter((r) => getValue(r, props.rowKey) !== getValue(row, props.rowKey))
    : [...props.selectedRows, row];
  emit("update:selectedRows", next);
  emit("selection-change", next);
}

function toggleAll() {
  const allSelected = filteredSortedData.value.length > 0 && props.selectedRows.length === filteredSortedData.value.length;
  const next = allSelected ? [] : [...filteredSortedData.value];
  emit("update:selectedRows", next);
  emit("selection-change", next);
}

const confirmOpen = ref(false);
const confirmMessage = ref("");
const confirmAction = ref<(() => void) | null>(null);

const iconMap: Record<string, unknown> = {
  edit: Edit,
  delete: Trash2,
  view: Eye,
};

function resolveIcon(name: string | undefined) {
  if (!name) return null;
  return iconMap[name] || null;
}

function alignClass(align?: string) {
  switch (align) {
    case "center": return "text-center";
    case "right": return "text-right";
    default: return "text-left";
  }
}

function cellClass(row: Record<string, unknown>, column: Column) {
  if (!column.cellClass) return "";
  if (typeof column.cellClass === "function") return column.cellClass(row);
  return column.cellClass;
}

function actionVisible(action: Action, row: Record<string, unknown>) {
  if (action.visible === undefined) return true;
  if (typeof action.visible === "function") return action.visible(row);
  return action.visible;
}

function actionDisabled(action: Action, row: Record<string, unknown>) {
  if (action.disabled === undefined) return false;
  if (typeof action.disabled === "function") return action.disabled(row);
  return action.disabled;
}

async function runAction(action: Action, row: Record<string, unknown>) {
  if (action.confirm) {
    const message = typeof action.confirmMessage === "function"
      ? action.confirmMessage(row)
      : action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()}?`;
    confirmMessage.value = message;
    confirmAction.value = () => action.handler(row);
    confirmOpen.value = true;
  } else {
    await action.handler(row);
  }
}

function onConfirm() {
  confirmAction.value?.();
  confirmAction.value = null;
  confirmOpen.value = false;
}

function onCancel() {
  confirmAction.value = null;
  confirmOpen.value = false;
}

const localSortKey = ref<string | undefined>(props.sortKey);
const localSortDirection = ref<"asc" | "desc">(props.sortDirection);

const effectiveSortKey = computed(() => props.sortKey ?? localSortKey.value);
const effectiveSortDirection = computed(() => (props.sortKey !== undefined ? props.sortDirection : localSortDirection.value));

function canSort(column: Column) {
  return props.sortable && column.sortable;
}

function onSort(column: Column) {
  if (!canSort(column)) return;
  const key = column.key;
  const direction = effectiveSortKey.value === key && effectiveSortDirection.value === "asc" ? "desc" : "asc";
  localSortKey.value = key;
  localSortDirection.value = direction;
  emit("update:sortKey", key);
  emit("update:sortDirection", direction);
  emit("sort", { key, direction });
}

function sortIcon(column: Column) {
  if (effectiveSortKey.value !== column.key) return null;
  return effectiveSortDirection.value === "asc" ? ChevronUp : ChevronDown;
}

const localQuery = ref(props.searchQuery);

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  localQuery.value = value;
  emit("update:searchQuery", value);
  emit("search", value);
}

const filters = ref<Record<string, string>>({});
const filterOptions = computed(() => buildFilterOptions(props.columns, props.data));

function onFilterChange(key: string, value: string) {
  filters.value = { ...filters.value, [key]: value };
}

const activeFilterCount = computed(() => Object.values(filters.value).filter((v) => v !== "").length + (localQuery.value ? 1 : 0));

function clearFilters() {
  filters.value = {};
  localQuery.value = "";
  emit("update:searchQuery", "");
  emit("search", "");
}

const filteredData = computed(() => filterData(props.data, props.columns, filters.value, localQuery.value, props.searchable));
const filteredSortedData = computed(() => sortData(filteredData.value, effectiveSortKey.value, effectiveSortDirection.value));

const showHeader = computed(() => props.title || props.description || props.primaryAction);
const hasActions = computed(() => (props.actions?.length ?? 0) > 0);
const normalActions = computed(() => props.actions?.filter((a) => a.variant !== "danger") || []);
const dangerActions = computed(() => props.actions?.filter((a) => a.variant === "danger") || []);
const colCount = computed(() => {
  let count = props.columns.length;
  if (props.selectable) count++;
  if (hasActions.value) count++;
  return count;
});

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));
const pageRange = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  return pages;
});

function setPage(page: number) {
  emit("update:page", page);
  emit("page-change", page);
}

function setPageSize(size: number) {
  emit("update:pageSize", size);
}

const hasBulkActions = computed(() => props.selectable && props.selectedRows.length > 0 && props.bulkActions.length > 0);

async function runBulkAction(action: BulkAction) {
  if (action.confirm) {
    confirmMessage.value = action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} ${props.selectedRows.length} item(s)?`;
    confirmAction.value = () => action.handler(props.selectedRows);
    confirmOpen.value = true;
  } else {
    await action.handler(props.selectedRows);
  }
}
</script>

<template>
  <div class="w-full">
    <div v-if="showHeader" class="flex flex-wrap items-start justify-between gap-4 mb-5">
      <div class="flex items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h2 v-if="title" class="text-xl font-bold tracking-tight">{{ title }}</h2>
            <span v-if="!loading && data.length > 0" class="text-xs font-mono text-neutral-400 dark:text-neutral-500">
              <template v-if="activeFilterCount > 0 && filteredData.length !== data.length">
                ({{ filteredData.length }} of {{ data.length }})
              </template>
              <template v-else>({{ data.length }})</template>
            </span>
          </div>
          <p v-if="description" class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{{ description }}</p>
        </div>
      </div>
      <div v-if="primaryAction" class="flex items-center gap-2">
        <slot name="header-actions" />
        <UiButton @click="primaryAction.handler">
          <component v-if="primaryAction.icon" :is="primaryAction.icon" class="w-4 h-4 mr-2" />
          {{ primaryAction.label }}
        </UiButton>
      </div>
    </div>

    <div v-if="searchable || filterOptions.length > 0" class="mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <div v-if="searchable" class="flex-1 min-w-[200px] max-w-md relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            :value="localQuery"
            :placeholder="searchPlaceholder"
            @input="onSearchInput"
            class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div v-for="item in filterOptions" :key="item.key" class="min-w-[220px]">
          <select
            :value="filters[item.key] || ''"
            @change="onFilterChange(item.key, ($event.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:border-accent-500 focus:outline-none"
          >
            <option value="">All {{ item.label }}s</option>
            <option v-for="opt in item.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <button v-if="activeFilterCount > 0" type="button" @click="clearFilters" class="px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">Clear filters</button>
        <div v-if="hasBulkActions" class="flex items-center gap-2 ml-auto">
          <span class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{{ selectedRows.length }} selected</span>
          <div class="flex items-center gap-1.5">
            <button
              v-for="(action, index) in bulkActions"
              :key="index"
              type="button"
              @click="runBulkAction(action)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              :class="action.variant === 'danger' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'"
            >
              <component v-if="action.icon" :is="action.icon" class="w-4 h-4" />
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <slot name="toolbar" />

    <div class="rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-transparent">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-300 dark:border-neutral-700">
            <tr>
              <th v-if="selectable" class="px-4 py-2.5 w-12">
                <div class="flex items-center justify-center">
                  <input
                    type="checkbox"
                    :checked="filteredSortedData.length > 0 && selectedRows.length === filteredSortedData.length"
                    :indeterminate="selectedRows.length > 0 && selectedRows.length < filteredSortedData.length"
                    @change="toggleAll"
                    class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-600 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer transition-colors"
                  />
                </div>
              </th>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                :class="[alignClass(column.align), column.width || '', canSort(column) && 'cursor-pointer select-none group']"
                @click="onSort(column)"
              >
                <div class="inline-flex items-center gap-1" :class="[column.align === 'right' && 'flex-row-reverse', canSort(column) && 'hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors']">
                  <span>{{ column.label }}</span>
                  <span v-if="canSort(column)" class="inline-flex items-center justify-center w-5 h-5 rounded transition-all duration-150" :class="effectiveSortKey === column.key ? 'bg-accent-100 dark:bg-accent-900/50' : 'group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'">
                    <component v-if="sortIcon(column)" :is="sortIcon(column)" class="w-3.5 h-3.5" :class="effectiveSortKey === column.key ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400 dark:text-neutral-500'" />
                  </span>
                </div>
              </th>
              <th v-if="hasActions" class="px-4 py-2.5 text-right font-medium text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 w-24">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-if="loading">
              <td :colspan="colCount" class="px-4 py-16">
                <slot name="loading">
                  <div class="flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <span class="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span class="text-sm">Loading data...</span>
                  </div>
                </slot>
              </td>
            </tr>
            <tr v-else-if="filteredSortedData.length === 0">
              <td :colspan="colCount" class="px-4 py-16">
                <slot name="empty">
                  <div class="flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <div class="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Inbox class="w-6 h-6" />
                    </div>
                    <p class="text-sm">{{ emptyMessage }}</p>
                    <button v-if="activeFilterCount > 0" @click="clearFilters" type="button" class="text-xs text-accent-600 dark:text-accent-400 hover:underline font-medium">Clear filters</button>
                  </div>
                </slot>
              </td>
            </tr>
            <tr
              v-else
              v-for="(row, index) in filteredSortedData"
              :key="(row[rowKey] as string | number) ?? index"
              class="transition-all duration-150 cursor-pointer relative"
              :class="isRowSelected(row) ? 'bg-accent-50 dark:bg-accent-950/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'"
              @click="$emit('row-click', row)"
            >
              <div v-if="isRowSelected(row)" class="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-500" />
              <td v-if="selectable" class="px-4 py-3" @click.stop>
                <div class="flex items-center justify-center">
                  <input type="checkbox" :checked="isRowSelected(row)" @change="toggleRow(row)" class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-accent-600 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer transition-colors" />
                </div>
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-3 text-sm"
                :class="[alignClass(column.align), cellClass(row, column), isRowSelected(row) ? 'text-accent-900 dark:text-accent-100' : 'text-neutral-700 dark:text-neutral-300']"
              >
                <slot :name="`cell-${column.key}`" :value="row[column.key]" :row="row" :column="column">
                  <span v-if="column.html" v-html="formatCell(row, column)" />
                  <template v-else>{{ formatCell(row, column) }}</template>
                </slot>
              </td>
              <td v-if="hasActions" class="px-4 py-3 text-right" @click.stop>
                <div class="inline-flex gap-0.5">
                  <button
                    v-for="(action, index) in normalActions"
                    :key="`non-delete-${index}`"
                    :disabled="actionDisabled(action, row)"
                    @click="runAction(action, row)"
                    class="p-1.5 rounded-md transition-all duration-150"
                    :class="actionDisabled(action, row) ? 'opacity-30 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800'"
                    :title="action.label"
                    v-show="actionVisible(action, row)"
                  >
                    <component :is="resolveIcon(action.icon)" class="w-4 h-4" />
                  </button>
                  <slot name="extra-actions" :row="row" />
                  <button
                    v-for="(action, index) in dangerActions"
                    :key="`delete-${index}`"
                    :disabled="actionDisabled(action, row)"
                    @click="runAction(action, row)"
                    class="p-1.5 rounded-md transition-all duration-150"
                    :class="actionDisabled(action, row) ? 'opacity-30 cursor-not-allowed' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30'"
                    :title="action.label"
                    v-show="actionVisible(action, row)"
                  >
                    <component :is="resolveIcon(action.icon)" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="paginated" class="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between text-sm">
        <div class="text-neutral-500 dark:text-neutral-400">
          Page {{ page }} of {{ totalPages }} ({{ totalItems }} total)
        </div>
        <div class="flex items-center gap-2">
          <select :value="pageSize" @change="setPageSize(Number(($event.target as HTMLSelectElement).value))" class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} / page</option>
          </select>
          <div class="flex items-center gap-1">
            <button
              v-for="p in pageRange"
              :key="p"
              @click="setPage(p)"
              class="w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors"
              :class="p === page ? 'bg-accent-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'"
            >{{ p }}</button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog v-model="confirmOpen" title="Confirm Action" :message="confirmMessage" confirm-text="Confirm" cancel-text="Cancel" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>
