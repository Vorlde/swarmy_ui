# Composition Canvas - Domain Model

Project: **swarmy_ui**. Original TypeScript. All canvas state derives from these shapes.

## 1. Core geometry

```ts
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}
```

All canvas coordinates are in **canvas space** (unscaled content pixels). Because the transform layer uses the CSS `zoom` property, the viewport translate is itself in canvas units: screen space = `(canvas + translate) * scale` (see `panzoom.md` Section 2).

## 2. CompositionLayout

The single object the canvas renders. Produced by the layout generator (Section 8) from API data.

```ts
export interface CompositionLayout {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  bounds: Bounds; // tight bounding box of all nodes + groups, used by fitToView
}
```

## 3. Nodes

```ts
// The six kinds actually rendered on the canvas. This is also the key set of the node-type registry.
export type NodeKind =
  | 'agent'      // AGENT root card
  | 'prompt'     // PROMPT card (one AI side of an agent or sub-agent)
  | 'human'      // Human card (a human side)
  | 'function'   // FUNCTION card
  | 'subagent'   // SUB-AGENT card (also produces a CanvasGroup)
  | 'model';     // MODEL card

export interface BaseNode extends Bounds {
  id: string;            // unique within the layout, e.g. "agent:fraud_review_agent"
  kind: NodeKind;
  width: number;         // minimum width; actual size measured at runtime
  height: number;        // estimated; corrected by measurement
  data: unknown;
}

export type CanvasNode =
  | AgentNode | PromptNode | HumanNode | FunctionNode | SubagentNode | ModelNode;
```

### Node-type registry (the pluggable seam)

Node components are looked up by `kind`, never selected with a `v-if`/`switch` chain in a template:

```ts
// nodeRegistry.ts - a plain module, not a framework
export const nodeRegistry: Record<NodeKind, Component> = {
  agent:    AgentNode,
  prompt:   SidePromptNode,   // renders the PROMPT card
  human:    SidePromptNode,   // same component, human mode
  function: ToolNode,
  subagent: AgentLockupCard,
  model:    ModelNode,
};
```

`CompositionCanvas` renders `<component :is="nodeRegistry[node.kind]" .../>`. Adding or replacing a card
type is a registry entry, not a template edit.

Every rendered node element carries `data-canvas-node` and `data-canvas-node-id="<id>"`; model nodes
additionally carry `data-canvas-model-node`.

### 3.1 Agent node (root)

```ts
export interface AgentVariable {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface AgentData {
  id?: string;
  name: string;                 // machine name, e.g. "fraud_review_agent"
  title: string;
  type: string;                 // "dual_ai" | "ai_human" | ...
  description?: string | null;
  icon?: string | null;
  sideALabel?: string | null;
  sideBLabel?: string | null;
  sideAPromptName?: string | null;
  sideBPromptName?: string | null;
  defaultModel?: string;
  defaultPrompt?: string;
  env?: Record<string, string> | null;
  variables?: AgentVariable[];
  isSubagent?: boolean;         // true when rendered inside a group
  packed?: boolean;
}

export interface AgentNode extends BaseNode {
  kind: 'agent';
  data: AgentData & {
    /** Per-side summary columns rendered inside the root card itself
     *  (`SUPPORT` / `HUMAN` for ai_human, `WORKER` / `REVIEWER` style labels for dual_ai). */
    sides: SideSummary[];
  };
}

/** Rendered as one column in the lower half of the AGENT and SUB-AGENT cards. */
export interface SideSummary {
  id: SideId;
  label: string;                 // uppercase chip label, e.g. "SUPPORT"
  mode: 'ai' | 'human';
  promptName?: string;           // "order_support"; human sides show "No prompt"
  stopOnResponse?: boolean;      // rendered as On / Off
  stopTool?: string | false;
  maxSteps?: number;
  endConversationTool?: string | false;
}
```

### 3.2 Prompt node and Human node

The two sides of an agent are **separate nodes on the canvas** (the root card only summarises them):
an AI side is a `prompt` node, a human side is a `human` node.

```ts
export type SideId = 'a' | 'b';

export interface PromptNode extends BaseNode {
  kind: 'prompt';
  data: {
    sideId: SideId;
    sideLabel: string;           // the pill next to the "PROMPT" eyebrow, e.g. "SUPPORT"
    prompt: PromptData;
    /** Right-hand rail sections; each renders its list or the muted word "None". */
    functions: string[];
    subPrompts: string[];
    handoffs: string[];
    subagents: string[];
  };
}

export interface HumanNode extends BaseNode {
  kind: 'human';
  data: { sideId: SideId; label: string; description: string };
}
```

### 3.3 Function node

```ts
export type ToolKind =
  | 'tool'        // function tool with input/output schema
  | 'prompt'      // prompt used as a tool
  | 'subagent'    // embedded agent (also produces a group)
  | 'handoff'     // transfers control to another agent
  | 'provider'    // provider-native tool (web search, code interpreter, ...)
  | 'mcp';        // MCP server tool

export interface ToolNodeData {
  kind: ToolKind;
  name: string;
  displayName: string;
  description?: string;
  config?: Record<string, unknown>;
  // Resolved lazily by ToolNode via the API:
  detail?: ToolDetail;
}

/** Only `kind: 'tool'` gets its own FUNCTION node on the canvas; `prompt`, `subagent`, `handoff`,
 *  `provider` and `mcp` references are listed in the PROMPT card's right-hand rail, and `subagent`
 *  additionally produces a SubagentNode + CanvasGroup. */
export interface FunctionNode extends BaseNode {
  kind: 'function';
  data: ToolNodeData;
}

export interface SubagentNode extends BaseNode {
  kind: 'subagent';
  data: AgentData & {
    typePill: string;            // "DUAL AI"
    maxSessionTurns?: number;    // rendered as the "max 8 session turns" chip
    description?: string;
    sides: SideSummary[];
  };
}

export interface ToolRef {
  kind: ToolKind;
  name: string;
}

export interface ToolDetail {
  name: string;
  description?: string;
  inputSchema?: unknown;        // JSON schema
  outputSchema?: unknown;
  variables?: AgentVariable[];
  promptName?: string;          // for kind === 'prompt'
  targetAgent?: string;         // for kind === 'handoff' | 'subagent'
}
```

### 3.4 Hook node - not rendered

No hook card appears in the reference capture, and `hook` is not one of the six kinds. Hooks are data on
the agent, surfaced in the structure tree and the inspector, not as canvas nodes. `HookNode.md` is kept
as an unverified registry candidate; do not add `'hook'` to `NodeKind` until a capture shows one.

### 3.5 Model node

```ts
export interface ModelCapabilities {
  supportsImages?: boolean;
  supportsToolCalls?: boolean;
  supportsStreaming?: boolean;
  supportsJsonMode?: boolean;
  maxContextTokens?: number;
  maxOutputTokens?: number;
}

export interface PriceRange { min: number; max: number; }

export interface ModelFallback { name: string; }

export interface ModelNodeData {
  id: string;
  name: string;
  model?: string;               // upstream model id, e.g. "deepseek/deepseek-v4-flash"
  provider: string;             // e.g. "openrouter"
  capabilities?: ModelCapabilities;
  providerTools?: string[];
  fallbacks?: ModelFallback[];
  inputPrice?: number;          // USD per 1M input tokens
  outputPrice?: number;
  pricingRange?: { input: PriceRange; output: PriceRange };
}

export interface ModelNode extends BaseNode {
  kind: 'model';
  data: ModelNodeData;
}
```

### 3.6 Prompt data (shared)

```ts
export interface PromptData {
  name: string;
  body?: string;
  modelName?: string;
  modelProvider?: string;
  modelId?: string;
  requiredSchema?: unknown;     // JSON schema for prompt input
  variables?: AgentVariable[];
  maxTurns?: number;
}
```

## 4. Edges

```ts
export type EdgeKind = 'structural' | 'model';

export interface CanvasEdge {
  id: string;            // `${from}->${to}` or explicit unique id
  from: string;          // node id
  to: string;            // node id
  kind: EdgeKind;
  sideId?: SideId;       // which side column this edge belongs to (color + routing lane)
  toolKind?: ToolKind;   // set when `to` is a tool node; drives per-kind column anchoring
}
```

Routing semantics:

- `structural` edges go from **source bottom-center** to **target top-center** (or per-kind tool column top). Solid.
- `model` edges go from a prompt node's **model anchor point** (`nodeMetrics[id].modelAnchorY`, the inline model chip in the PROMPT card header) to the model node's top or side anchor. Dashed.

Each rendered `<path>` carries `data-edge-id="<id>"`, `data-edge-kind="structural|model"`, and
`data-edge-tool-kind="<ToolKind>"` when `toolKind` is set.

## 5. Groups (subagent boundaries)

```ts
export interface CanvasGroup extends Bounds {
  id: string;
  label: string;               // subagent display name, rendered UPPERCASE in the chip
  badges: string[];            // e.g. ["Blocking", "Single"]
  subagent?: {
    resumable?: boolean;
    multiInstance?: boolean;
  };
}
```

Groups are containers only; they have no edges of their own. Nodes inside a subagent carry coordinates in the same canvas space (no nested coordinate systems).

Rendered chrome (`[data-canvas-group]`) - **solid border, not dashed**:

- Container: `border border-neutral-200/60 bg-[#f7f7f7] dark:border-neutral-700/50 dark:bg-[#1e1e1e]`, `border-radius: 8px`, no shadow.
- Own dot sub-grid inside the container: `<pattern width="20" height="20"><circle r="0.75" class="fill-neutral-400/15">`.
- Label chip: `absolute -top-3 left-4 rounded bg-white px-2 py-0.5 dark:bg-neutral-900`, label `text-[10px] font-semibold uppercase tracking-wider text-neutral-600`.
- Badges next to the label: `rounded-full px-1.5 py-px text-[9px] font-medium bg-neutral-100 text-neutral-500`.

## 6. Runtime measurement

```ts
export interface ToolColumnMetric {
  left: number;   // canvas-space left of the column, relative to node left
  width: number;
}

export interface NodeMetric {
  modelAnchorY?: number;                          // canvas-space Y of the model anchor inside the node
  toolColumns?: Record<string, ToolColumnMetric>; // keyed by ToolKind
}

export type NodeMetrics = Record<string, NodeMetric>;

export interface Measurement {
  w: number;
  h: number;
  modelAnchorY?: number;
  toolColumns?: Record<string, ToolColumnMetric>;
}
```

Node components mark anchor elements with data attributes so the measurement composable can find them:

- `data-model-anchor` - the inline model chip in the PROMPT card header; its vertical center is the model edge anchor.
- `data-tool-column="<kind>"` - column container for tools of that kind.
- `data-variables-section` - the Variables block inside a card.

Full set of canvas data attributes present in the live DOM (use these exact names):
`data-canvas-node`, `data-canvas-node-id`, `data-canvas-group`, `data-canvas-model-node`,
`data-edge-id`, `data-edge-kind`, `data-edge-tool-kind`, `data-model-anchor`,
`data-variables-section`, `data-tool-column`.

## 7. CanvasTheme (the swappable layer)

Injected via `provide('canvasTheme', theme)`. Node cards, edges, grid, and groups read all visual values from it. The layout generator, router, and pan/zoom never read the theme.

```ts
export interface CanvasTheme {
  grid: {
    dotColor: string;
    dotSpacing: number;       // px in canvas space, base 24
    dotRadius: number;
  };
  node: {
    borderRadius: string;     // e.g. theme-radius token
    borderColor: string;      // neutral cards #d4d4d4; agent/subagent #171717
    sideAccent: { a: string; b: string };  // card border for side nodes: sky #00a6f4 / amber #fe9a00
    background: string;
    /** Canvas cards are flat: 'none'. 'hatch' selects the app's sibling-<canvas> diagonal-hatch
     *  shadow (offset 6px right / 6px bottom, follows the corner radius) used by popovers and
     *  modals. There is no CSS box-shadow anywhere in this app. */
    elevation: 'none' | 'hatch';
    headerTextColor: string;
    mutedTextColor: string;
    selectedRingColor: string;
    hoverDimOpacity: number;  // default 0.25
  };
  edge: {
    strokeWidth: number;          // 1.5
    highlightedWidth: number;     // 2
    hoveredWidth: number;         // 2.25
    modelDashArray: string;       // "4 4"
    /** The shipped theme resolves ALL of these to the same neutral (~#d4d4d4): the reference
     *  capture shows no coloured edges. They stay as separate hooks so a theme can differentiate. */
    colors: {
      model: string;
      subagent: string;
      sideA: string;
      sideB: string;
      default: string;            // neutral - what every edge currently uses
    };
  };
  group: {
    borderColor: string;          // neutral-200/60 light, neutral-700/50 dark
    background: string;           // #f7f7f7 light, #1e1e1e dark
    borderRadius: string;         // 8px
    labelColor: string;
    subGrid: { spacing: number; radius: number; color: string };  // 20 / 0.75 / neutral-400/15
  };
  selection: {
    surface: string;              // color-mix(in oklab, var(--accent-500) 18%, #fff) = #efe3ff / #302043
    hoverSurface: string;         // #f8f2ff light / #1c1525 dark
  };
}
```

The default theme maps to the design tokens in `04-assets-css/design-tokens.md` and to the measured
values in the visual reference: `--accent-500 #a855f7`, the oklch neutral scale, 8px group radius, and
**no `shadow-*` utility anywhere** - canvas cards are border-only.

## 8. Layout generation

```ts
export type ModelPlacement = 'outboard-left' | 'outboard-right' | 'below-row';

export function buildCompositionLayout(input: {
  agent: AgentData;
  sideCompositions: SideComposition[];     // resolved sides with prompts + tools
  subagentCompositions: AgentComposition[]; // recursive
  models: ModelNodeData[];                  // catalog for resolving model refs
  toolsCatalog: ToolDetail[];               // catalog for display names/descriptions
}): CompositionLayout;
```

Rules:

1. Agent node at top center.
2. Side A node (`prompt`) left of the vertical axis, side B node (`prompt` or `human`) right; single-side agents center their side.
3. Function nodes for a side are laid out in per-kind columns beneath that side.
4. Models are placed with a placement heuristic: outboard-left (side A models), outboard-right (side B models), or below-row when outboard space is exhausted.
5. Subagents produce a `subagent` node plus a `CanvasGroup` sized to their inner layout plus padding, and their internal nodes are offset into canvas space.
6. `bounds` = union of all node/group rects inflated by 40px. `fitToView(bounds)` on mount yields 11% for the reference agent.

The algorithm is deterministic: same input, same layout. Node `width` values are minimum widths; final sizes come from measurement.

## 9. Selection / viewport state

```ts
export interface CanvasSelection {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  focusedGroupId: string | null;
}

export interface EditTarget {
  entityType: 'agent' | 'prompt' | 'tool' | 'model' | 'hook';
  entityId: string;
  section?: string;          // e.g. "body", "schema", "variables"
  defaultToolTab?: string;
}
```
