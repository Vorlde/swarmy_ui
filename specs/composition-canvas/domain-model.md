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

All canvas coordinates are in **canvas space** (unscaled content pixels). Screen space = `canvas * scale + translate` (see `panzoom.md`).

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
export type NodeType = 'agent' | 'side' | 'tool' | 'hook' | 'model';

export interface BaseNode extends Bounds {
  id: string;            // unique within the layout, e.g. "agent:fraud_review_agent"
  type: NodeType;
  width: number;         // minimum width; actual size measured at runtime
  height: number;        // estimated; corrected by measurement
  data: unknown;
}

export type CanvasNode = AgentNode | SideNode | ToolNode | HookNode | ModelNode;
```

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
  type: 'agent';
  data: AgentData;
}
```

### 3.2 Side node (side A / side B)

```ts
export type SideId = 'a' | 'b';

export interface SideNode extends BaseNode {
  type: 'side';
  data: {
    id: SideId;
    mode: 'human' | 'ai';       // human side renders a person card, not a prompt card
    label: string;              // e.g. "Risk Analyst"
    prompt?: PromptData;        // present when mode === 'ai'
    tools?: ToolRef[];
    variables?: AgentVariable[];
  };
}
```

### 3.3 Tool node

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

export interface ToolNode extends BaseNode {
  type: 'tool';
  data: ToolNodeData;
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

### 3.4 Hook node

```ts
export interface HookNode extends BaseNode {
  type: 'hook';
  data: { hook: string };       // hook event name
}
```

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
  type: 'model';
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

- `structural` edges go from **source bottom-center** to **target top-center** (or per-kind tool column top).
- `model` edges go from a prompt/side node's **model anchor point** (`nodeMetrics[id].modelAnchorY`) to the model node's top or side anchor.

## 5. Groups (subagent boundaries)

```ts
export interface CanvasGroup extends Bounds {
  id: string;
  label: string;               // subagent display name
  subagent?: {
    resumable?: boolean;
    multiInstance?: boolean;   // draws stacked shadow layers
  };
}
```

Groups are containers only; they have no edges of their own. Nodes inside a subagent carry coordinates in the same canvas space (no nested coordinate systems).

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

- `data-model-anchor` - element whose vertical center is the model edge anchor.
- `data-tool-column="<kind>"` - column container for tools of that kind.

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
    borderColor: string;
    background: string;
    shadow: string;
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
    colors: {
      model: string;              // purple accent
      subagent: string;           // emerald
      sideA: string;              // sky
      sideB: string;              // amber
      default: string;            // neutral
    };
  };
  group: {
    borderColor: string;
    background: string;
    labelColor: string;
    stackedLayerOffset: number;   // px per multi-instance shadow layer
  };
}
```

The default theme maps to the design tokens in `04-assets-css/design-tokens.md` (accent-500 purple, oklch neutral scale, `--radius-lg`, `shadow-sm`).

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
2. Side A column(s) left of the vertical axis, side B right; single-side agents center their side.
3. Tools of a side are laid out in per-kind columns beneath that side.
4. Hooks sit in a row directly under the agent.
5. Models are placed with a placement heuristic: outboard-left (side A models), outboard-right (side B models), or below-row when outboard space is exhausted.
6. Subagents produce a group sized to their inner layout plus padding, and their internal nodes are offset into canvas space.
7. `bounds` = union of all node/group rects inflated by 40px.

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
