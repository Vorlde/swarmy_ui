# Composition Canvas - Wireframes

Project: **swarmy_ui**. ASCII wireframes. Proportions approximate; the layout generator decides real positions.

## 1. Structure pane layout (cascade snap section 3)

The canvas is not its own screen. It is the right half of the **Structure** pane, which is snap
section 3 of the `/agents` cascade (`.composition-scroll-container`, scroll-snap x mandatory,
track `gap:12px`, section `rounded-xl border border-black/10 bg-white dark:bg-neutral-900`).

```
+--------------+ +--------------------------------------------------------------------+
| [sidebar]    | | [icon] Structure  order_support_agent      <- one shared header     |
|  Agents    3 | +----------------------+R+-------------------------------------------+
| [agent pill] | | .structure-tree      |e|  canvas viewport                           |
|              | | 320px, text-[12px]   |s|  relative flex-1 overflow-hidden           |
|  Threads   2 | | border-r neutral-200 |i|  bg-neutral-100/50 dark:bg-neutral-950/50  |
| |Structure   | |                      |z|  inner: absolute inset-0 cursor-grab       |
|              | | order_support_agent  |e|                                            |
|              | |  Variables      None |r|   . . 24px screen-space dot grid . . . .   |
|              | |  v Support           | |                                            |
|              | |    > Side Config     | |        (composition, see section 2)         |
|              | |    v order_support   | |                                            |
|              | |      default         | |                                            |
|              | |      ...             | |  [-] [ 11% ] [+] | [fit]                   |
|              | |                      | |  ^ absolute bottom-4 left-4 z-10           |
+--------------+ +----------------------+-+--------------------------------------------+
```

Resizer: `.structure-tree-resizer w-[5px] cursor-col-resize -mx-[2px]`, hairline
`w-px group-hover:bg-accent-500/60`. Width persisted as
`localStorage['composition.structureTreeWidth'] = "320"`.

The Inspector is **not** here - it is the third column of snap section 2.

## 2. Canvas anatomy (`order_support_agent`, AI + Human)

```
        +--------------------------------------------------------------------+
        |                       (24px screen-space grid dots)                |
        |                      +--------------------+                        |
        |                      |  AGENT (root)      |  border neutral-900    |
        |                      |  order_support_...  |                       |
        |                      +---------+----------+                        |
        |              +-----------------+------------------+                |
        |   +----------v-----------+                +-------v-------+        |
        |   | PROMPT  [SUPPORT]    |                | Human         |        |
        |   | border sky #00a6f4   |                | border amber  |        |
        |   | [chip default]<A>- - + - - - - - -    | #fe9a00       |        |
        |   | order_support        |           \    +---------------+        |
        |   +--+-----+-----+-------+            \                            |
        |      |     |     |                     \  +---------------------+  |
        | +----v+ +--v--+ +v-----+                ->| MODEL               |  |
        | | FUNC| |FUNC | |FUNC  |   ... x4          | [openrouter] default|  |
        | +-----+ +-----+ +------+                   | pricing / caps      |  |
        |                                            +---------------------+  |
        |  +-----------------------------------------------------------+     |
        |  |[INVENTORY_CHECK_AGENT] (Blocking)(Single)   <- label chip  |     |
        |  |  group: solid 1px neutral-200/60 on #f7f7f7, r=8,          |     |
        |  |  own 20px dot sub-grid                                     |     |
        |  |     +---------------------------+                          |     |
        |  |     | SUB-AGENT  [DUAL AI]      | border neutral-900       |     |
        |  |     +------+-------------+------+                          |     |
        |  |   +--------v----+   +----v--------+                        |     |
        |  |   |PROMPT[WORKER]|  |PROMPT[REVIEWER]| sky / amber borders  |     |
        |  |   +--+-------+---+  +--+---------+--+                       |     |
        |  |   +--v--+ +--v--+   +--v--+                                 |     |
        |  |   |FUNC | |FUNC |   |FUNC |                                 |     |
        |  |   +-----+ +-----+   +-----+                                 |     |
        |  +-----------------------------------------------------------+     |
        |                                                                    |
        |  [-] [ 11% ] [+] | [fit]                                           |
        +--------------------------------------------------------------------+
     CanvasControls: absolute bottom-4 LEFT-4 (not right)
```

Legend: `->` / `|` solid structural edge; `- - -` dashed model edge; `<A>` = `data-model-anchor`, the
inline model chip in the PROMPT card header. **All edges render the same neutral grey (~`#dcdcdc`) with
rounded elbows** - there are no per-side edge colours; side identity is the card border.

## 3. Node cards

Transcribed from the 51% node crops. Every card is flat white (`#fff`) with a 1px border and rounded
corners - **no shadow of any kind**. Internal dividers are `#d4d4d4` hairlines.

### `agent` - AgentNode (root). Border `#171717`.

```
+---------------------------------------+--------------------+
| [icon] AGENT   ( AI + HUMAN )         | (x) VARIABLES      |
|                                       |     None           |
|  [avatar]  order_support_agent        |                    |
|            order_support_agent (mono, muted)               |
+-------------------------+-------------+--------------------+
| [icon] SUPPORT   (sky)  | [icon] HUMAN   (amber)           |
| order_support  (mono)   | No prompt                        |
| Stop on response    On  |                                  |
| Stop tool          Off  |                                  |
| Max steps           20  |                                  |
| End conversation.. Off  |                                  |
+-------------------------+----------------------------------+
```

The type pill is `rounded-full` uppercase; value words `On` are accent-coloured per side (sky / amber),
`Off` and `-` are muted.

### `prompt` - SidePromptNode. Border sky `#00a6f4` (side A) / amber `#fe9a00` (side B).

```
+--------------------------------------------------------------+-----------------+
| [chat] PROMPT (SUPPORT)      [edit]  +--- data-model-anchor---+ [TS] FUNCTIONS  |
|                                      | [icon] default        || find_order      |
|  order_support   (mono, bold)        | deepseek/deepseek-v4  || check_refund_p. |
|  Handle customer order and refund    |  | : : (4 cap dots)   || issue_refund    |
|  requests                            +-----------------------+| close_ticket    |
+----------------+---------------------+----------------------+-----------------+
| TOOL           | [icon] INPUT SCHEMA                        | [icon] SUB-PROMPTS
| Tool choice auto|  None                                     |  None            |
| Parallel calls off|                                         +-----------------+
| CONTEXT        |                                            | [icon] HANDOFFS  |
| Chat history on|                                             |  None            |
| Past tool calls on| -------------------------------------- +-----------------+
| Reasoning in h. off| (x) VARIABLES                          | [icon] SUB-AGENTS|
| REASONING      |  None                                      | inventory_check..|
| Effort      off|                                            | fraud_review_ag..|
| Max tokens    -|                                            |                  |
| Exclude from.. off|                                         |                  |
+----------------+--------------------------------------------+-----------------+
```

Rail eyebrow colours: FUNCTIONS blue, SUB-PROMPTS fuchsia, HANDOFFS sky, SUB-AGENTS emerald. Section
eyebrows (`TOOL` / `CONTEXT` / `REASONING` / `INPUT SCHEMA` / `VARIABLES`) are `text-[10px]` uppercase
tracking-wider muted. The Variables block carries `data-variables-section`.

### `human` - SidePromptNode, human mode. Border amber `#fe9a00`.

```
+--------------------------------------+
| [person] Human                       |
+--------------------------------------+
| Receives user messages and input.    |   (muted)
+--------------------------------------+
```

### `function` - ToolNode / FunctionToolCard. Border `#d4d4d4`.

```
+---------------------------------------------------------------+
| [TS] FUNCTION                                                 |
|                                                               |
| find_order (mono, bold)   Look up a customer order by its      |
|                           order ID. Returns the item, amount,  |
|                           days since delivery, and status.     |
+---------------------------------------------------------------+
| [icon] ARGS                                                   |
|   . orderId *   ( string )                                    |
|     The order ID, for example A-1002                          |
+---------------------------------------------------------------+
```

Name left, description right - a two-column header, not a subtitle stack. There is no
`in: N - out: M` arity line and no expand chevron in the reference.

### `subagent` - AgentLockupCard. Border `#171717`.

```
+-------------------------------------------+--------------------+
| [icon] SUB-AGENT  ( DUAL AI )             | (x) VARIABLES      |
|                                           |     None           |
| [avatar] inventory_check_agent            |                    |
|          inventory_check_agent (mono)     |                    |
| ( max 8 session turns )                   |                    |
| Check warehouse stock for a product SKU   |                    |
| across all locations, with a second AI... |                    |
+---------------------------+---------------+--------------------+
| [icon] WORKER      (sky)  | [icon] REVIEWER        (amber)     |
| inventory_worker          | inventory_reviewer                 |
| Stop on response      On  | Stop on response              On   |
| Stop tool            Off  | Stop tool                    Off   |
| Max steps             12  | Max steps                     12   |
| End conv. tool  finish_.. | End conversation tool        Off   |
+---------------------------+------------------------------------+
```

### `model` - ModelNode. Border `#d4d4d4`.

```
+--------------------------------------+
| [gear] MODEL      ( OPENROUTER )     |
|                                      |
| [icon] default                       |
|        deepseek/deepseek-v4-fla...   |  (mono, muted, truncated)
|        in $0.09-$0.2/M  out $0.18-.. |
+------------------+-------------------+
| . Vision         | * Tool Calls      |   dot = supported (green) / unsupported (grey)
+------------------+-------------------+
| * Streaming      | * JSON            |
+------------------+-------------------+
| MAX CONTEXT      | MAX OUTPUT        |
| 1,048,576        | 393,216           |
+------------------+-------------------+
```

Capabilities are a 2-column grid of hairline-separated cells with a leading dot, not pills, and there is
no `fallbacks: N` footer in the reference.

### Hook card

Not rendered. No hook node appears in any capture.

## 4. Floating controls

```
absolute bottom-4 left-4 z-10, rounded-lg, white pill:
+-----+---------+-----+ | +-----+
|  -  |   11%   |  +  | | | fit |
+-----+---------+-----+ | +-----+
```

Four controls: `-`, the percent readout, `+`, and a vertical hairline divider before the
**fit-to-screen** button (corner-brackets icon). There is **no lock indicator button**. Readout is
`min-w-[3rem] text-center text-[11px] font-medium tabular-nums text-neutral-500`. `+`/`-` step in
~4-percentage-point increments; the default fit reads `11%`.

## 5. Inspector panel (right, contextual)

```
+------------------------------+
| Inspector              [x]   |
+-------------------------------
| [Inspect|Agent|Prompt|Model] |  tab auto-selected by node type
|                              |
|  (agent tab)                 |
|  Name:  [fraud_review_agent] |
|  Type:  [dual_ai        v]   |
|  Side A label: [Risk ...]    |
|  Side A prompt:[risk_... v]  |
|  ...                         |
|              [Save] [Cancel] |
+------------------------------+
```

## 6. Edit surface (overlay)

```
+------------------------------------------------------------------+
| dimmed canvas backdrop                                           |
|        +--------------------------------------------------+      |
|        | Edit prompt: risk_analyst                   [x]  |      |
|        | [Body] [Schema] [Variables]                      |      |
|        | +----------------------------------------------+ |      |
|        | | (code editor for prompt body)                | |      |
|        | +----------------------------------------------+ |      |
|        |                                  [Save] [Cancel]|      |
|        +--------------------------------------------------+      |
+------------------------------------------------------------------+
```

## 7. Pack modal flow

```
[Pack] -> PackModal
+--------------------------------------+
| Pack agent: fraud_review_agent  [x]  |
| Package name: [@scope/fraud-review]  |
| Version:      [0.1.0]                |
|--------------------------------------|
| Dependencies (DependencyTree):       |
|  + fraud_review_agent (agent)        |
|    + risk_analyst (prompt) [Extract|Copy]  <- ExtractCopyToggle
|    + check_history (tool)  [Extract|Copy]|
|    + default (model)       [shared]  |
|--------------------------------------|
| [Analyze]              [Pack] [Cancel]|
+--------------------------------------+
        |  on success
        v
PublishModal
+--------------------------------------+
| Publish @scope/fraud-review@0.1.0 [x]|
| Target: (o) npm   ( ) custom registry|
| npm token: OK (from token-status)    |
|                          [Publish]   |
+--------------------------------------+

UnpackModal
+--------------------------------------+
| Unpack package                  [x]  |
| Package id: [@scope/pkg       ] [Go] |
|--------------------------------------|
| Contents (UnpackTree):               |
|  + fraud_review_agent (agent)        |
|    + risk_analyst (prompt) [shared - will skip / overwrite toggle]
|    + new_tool (tool)       [new]     |
|--------------------------------------|
|                         [Unpack]     |
+--------------------------------------+
```

## 8. Structure tree (left half of the Structure pane, not an alternative view)

It is shown **beside** the canvas at all times, not toggled with it. Body text is `text-[12px]`; rows
show a leading type icon, a label, and a right-aligned muted value or count. Counts are plain numbers;
absent values read `None`.

```
[icon] order_support_agent                    order_support_a...
  (x) Variables                                             None
  v [icon] Support
      > Side Config
      v [chat] order_support                          [edit icon]
          [cpu] default                          deepseek/dee...
          > Prompt Config
          [box] Input schema                                None
          (x) Variables                                     None
      v [wrench] Tools                                          6
          v [TS] Functions                                      4
              > find_order
              > check_refund_policy
              > issue_refund
              > close_ticket
          [chat] Sub-prompts                    [edit icon]     0
          [swap] Handoffs                                       0
          v [icon] Sub-agents                                   2
              v [icon] inventory_check_ag...        inventory_ch...
                  (x) Variables                                None
                  v [icon] Worker
                      > Side Config
                      v [chat] inventory_worker          [edit icon]
                          [cpu] default                deepseek/...
                          ...
```

Rows are recursive StructureTreeRow; selecting a row selects the same node id on the canvas and focuses it.
