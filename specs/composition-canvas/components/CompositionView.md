# CompositionView

Project: **swarmy_ui**. Top-level route component for the composition canvas feature. Owns data loading, selection state, and coordinates the three regions: AgentBrowserPanel (left), CompositionCanvas (center), InspectorPanel (right).

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

Full-viewport three-column flex layout. Left browser panel fixed width (~260px), center canvas flex-1, right inspector slides in at 320px only when `selectedNodeId` is set. The route query `?agent=` is two-way synced with selection.

## States

- **Loading**: canvas region shows skeleton with spinner; browser list still interactive.
- **Empty**: no agents returned - center shows "Create your first agent" call to action.
- **Error**: catalog or agent fetch failure shows an error panel with a Retry button that re-runs the load sequence.

## Theming

The view only sets layout chrome (panel widths, dividers, background). All values come from theme tokens: `--color-bg-base` for the page background, `--color-border` for dividers, spacing scale for gutters. Swapping the theme changes divider/background colors without touching this component's template logic.
