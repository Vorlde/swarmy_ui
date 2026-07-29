# Composition Canvas - Wireframes

Project: **swarmy_ui**. ASCII wireframes. Proportions approximate; the layout generator decides real positions.

## 1. Composition view layout

```
+------------------------------------------------------------------------------------------------+
| [nav] |  AGENT BROWSER   |            COMPOSITION CANVAS                |   INSPECTOR        |
|       |  +------------+  |                                            |  (contextual)       |
|       |  | search...  |  |                                            |                     |
|       |  +------------+  |                                            |                     |
|       |  o fraud_review  |                                            |                     |
|       |  o inventory_ck  |                                            |                     |
|       |  o order_support |                                            |                     |
|       |                |                                            |                     |
|       |  [Structure] [Canvas]  toggle                               |                     |
+------------------------------------------------------------------------------------------------+
```

## 2. Canvas anatomy (dual-AI agent)

```
        +------------------------------------------------------------------+
        |                              (grid dots)                         |
        |                                                                  |
        |                      +--------------------+                      |
        |                      |  AGENT (root)      |                      |
        |                      |  fraud_review_agent|                      |
        |                      |  dual_ai - 2 sides |                      |
        |                      +---------+----------+                      |
        |              +-----------------+------------------+              |
        |              | solid (sky)                          | solid (amber)
        |   +----------v-----------+              +-----------v----------+ |
        |   | SIDE A - Risk Analyst|              | SIDE B - Customer    | |
        |   | prompt: risk_analyst |              | Advocate             | |
        |   | model: default  <A>--+---- - - -    | prompt: cust_advocate| |
        |   +---+-----+------+-----+        \     +---+-----+------+-----+ |
        |       |     |      |                \       |     |      |       |
        |  +----v-+ +-v--+ +-v------+      - - \ - +-v--+ +-v--+ +-v----+ |
        |  |tool 1| |tool| |prompt  |            \ |tool| |hook| |mcp   | |
        |  |fn    | |fn 2| |tool    |             \|fn 3| |    | |tool  | |
        |  +------+ +----+ +--------+              +----+ +----+ +------+ |
        |                                                                  |
        |  +----------------------+        +----------------------+        |
        |  | MODEL (side A)       | - - - -| MODEL (side B)       |        |
        |  | [icon] default       | dashed | [icon] gpt-4o-mini   |        |
        |  | openrouter           |        | openai               |        |
        |  | $0.09-0.23 / $0.18-1|        | $0.15 / $0.60        |        |
        |  +----------------------+        +----------------------+        |
        |                                                                  |
        |   - - - - - - - - - - - - - - - - - - - - - - - - - - - -        |
        |   . SUBAGENT GROUP (dashed container)               .            |
        |   .  +----------+    +-----------+                  .            |
        |   .  | sub agent| -> | sub side  | -> [tools...]    .            |
        |   .  +----------+    +-----------+                  .            |
        |   - - - - - - - - - - - - - - - - - - - - - - - - - - - -        |
        |                                                                  |
        |                                              [-] [100%] [+] [ ]  |
        +------------------------------------------------------------------+
                                          CanvasControls (bottom right)
```

Legend: `->` / `|` solid structural edge; `- - -` dashed model edge; `<A>` = `data-model-anchor` element on the side card.

## 3. Node cards

### AgentNode (root)

```
+--------------------------------------+
| [icon]  fraud_review_agent           |
|         DUAL AI - 2 sides            |
|  A: Risk Analyst   B: Customer Adv.  |
|  vars: orderId* (string)             |
+--------------------------------------+
```

### SidePromptNode (AI mode)

```
+--------------------------------------+
| A  Risk Analyst              [edit]  |
| prompt: risk_analyst                 |
| +-- data-model-anchor -------------+ |
| | model: default     [model icon]  | |
| +----------------------------------+ |
| vars: orderId*, customer_tier        |
| tools: 2 fn - 1 prompt - 1 mcp       |
+--------------------------------------+
```

### SidePromptNode (human mode)

```
+----------------------+
| B  Human Receiver    |
| [person icon]        |
| waits for user input |
+----------------------+
```

### ToolNode variants

```
FunctionToolCard:            PromptCard (as tool):        AgentLockupCard (handoff):
+------------------+         +------------------+         +----------------------+
| [fx] check_hist  |         | [doc] summarize  |         | [->] escalate_agent  |
| function tool    |         | prompt tool      |         | handoff              |
| in: 2 - out: 1   |         | model: default   |         | target: human_queue  |
+------------------+         +------------------+         +----------------------+
```

### HookNode

```
+------------------+
| [zap] on_message |
+------------------+
```

### ModelNode

```
+--------------------------------------+
| [provider icon]  default             |
|                  deepseek-v4-flash   |
| openrouter                           |
| [img] [tools] [stream] [json]        |   capability chips (dimmed if unsupported)
| ctx 1,048,576 - out 393,216          |
| in $0.09-0.225 - out $0.18-1.00 /1M  |
| fallbacks: 2                         |
+--------------------------------------+
```

## 4. Floating controls

```
bottom-right of canvas:
+-----+-----+-------+-----+------+
|  -  | 100%|   +   | fit | lock |
+-----+-----+-------+-----+------+
```

`lock` indicator lights up when the auto-fit lock is set (user has manually panned/zoomed).

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

## 8. Structure tree (alternative view)

```
Structure: fraud_review_agent
|- [agent] fraud_review_agent
   |- [side A] Risk Analyst
   |  |- [prompt] risk_analyst
   |  |  `- [model] default
   |  |- [tool] check_customer_history
   |  `- [tool] finish_risk_review
   |- [side B] Customer Advocate
   |  |- [prompt] customer_advocate
   |  |  `- [model] gpt-4o-mini
   |  `- [hook] on_message
   `- [subagent] inventory_check_agent (group)
      `- ...
```

Rows are recursive StructureTreeRow; selecting a row selects the same node id on the canvas and focuses it.
