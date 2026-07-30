# CompositionView

Project: **swarmy_ui**. Owner of the composition data for the `/agents` cascade. It is not a three-column screen of its own: it supplies the **Structure** pane (cascade snap section 3), which is `StructureTree` + resizer + `CompositionCanvas` under one shared header. The Agents list is snap section 1 and the Inspector is the third column of snap section 2; neither is a child of this component.

## Purpose

Container component. It loads catalogs and the selected agent, computes the layout via `buildCompositionLayout`, holds `CanvasSelection`, and passes everything down. It contains no canvas rendering logic itself.

## Props

None (route component). Reads `?agent=<name>` from the route query.

## State

```ts
const agents = ref<AgentSummary[]>([]);
const catalogs = ref<{ models: ModelNodeData[]; tools: ToolDetail[]; hooks: string[] }>();
const selectedAgentId = ref<string | null>(null);
const layout = ref<CompositionLayout | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedNodeId = ref<string | null>(null);
const hoveredNodeId = ref<string | null>(null);
const refreshEpoch = ref(0);
const editTarget = ref<EditTarget | null>(null);
```

## Emitted events

None (route component).

## Slots

None.

## API calls

| Endpoint | When |
|---|---|
| `GET /api/agents` | mount, and after pack/unpack/save |
| `GET /api/models` | mount |
| `GET /api/tools` | mount |
| `GET /api/hooks` | mount |
| `GET /api/agents/{name}` | on agent select |
| `GET /api/prompts/{name}` | per side prompt of the selected agent (parallel) |

## Visual behavior

The Structure snap section is a `rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900` card in the cascade flex track (`gap: 12px`). Inside it: one header row `[icon] Structure  <agent name>`, then a horizontal flex of `.structure-tree` (resizable, default 320px, `border-r border-neutral-200`), `.structure-tree-resizer`, and the canvas viewport (`relative flex-1 overflow-hidden bg-neutral-100/50 dark:bg-neutral-950/50`).

Entering the section is a **scroll** animation, not a transform: selecting an agent appends the section and `.composition-scroll-container` (`overflow-x:auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`) smooth-scrolls to it. The route query `?agent=` is two-way synced with selection.

## States

- **Loading**: canvas region shows skeleton with spinner; browser list still interactive.
- **Empty**: no agents returned - center shows "Create your first agent" call to action.
- **Error**: catalog or agent fetch failure shows an error panel with a Retry button that re-runs the load sequence.

## Theming

The view only sets layout chrome (pane widths, dividers, background). All values come from theme tokens: `--color-bg-base` for the page background, `--color-border` (`#d4d4d4` light / `#404040` dark) for dividers, spacing scale for gutters. It also `provide`s `canvasTheme` and the `nodeRegistry` so a reskin or a new card kind never reaches the canvas engine. Swapping the theme changes divider/background colors without touching this component's template logic.
