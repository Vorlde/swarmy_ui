# swarmy_ui - Wireframe Gallery

All swarmy_ui wireframes in one place for review. Sections: **App Shell**, **Views**, **Canvas**, **Components**. Proportions are approximate; real geometry comes from the layout system and the tokens in `docs/design/design-system.md`.

---

## Section 1: App Shell

The guarded layout: a collapsible sidebar rail on the left, a scrollable content area on the right. Every authenticated view renders inside this shell; the only public route (`/login`) renders on a bare centered stage instead. Views never render their own chrome - swapping the sidebar for a top nav is a shell-only change.

```
+--------+--------------------------------------------------------------+
|        |                                                              |
| Side   |                  CONTENT AREA (view route)                   |
| bar    |                                                              |
| nav    |    view card: header row (title, filters, action)            |
|        |                + table / grid / editor / canvas              |
| rail   |                                                              |
|        |                                                              |
+--------+--------------------------------------------------------------+
```

- Sidebar: `w-60` expanded, `w-16` collapsed icon rail, 300ms width transition.
- Content area: full-height card surfaces (`--color-background-soft`) on the app stage (`--color-background`).
- Public layout: no sidebar, no `EditSurfaceHost`; a centered card on the app background (see Login view).

---

## Section 2: Views (14)

### 2.1 Login (`/login`, public)

The only public route and the auth wall. A ~360px centered card with username/password fields, a block primary submit, and an alert region for server-side failures. On success the user is routed to their original `?redirect=` target or `/agents`.

```
+------------------------------------------------------------------+
|  (app background: bg-background)                                 |
|                                                                  |
|                +------------------------------------+            |
|                |  [logo mark]                       |            |
|                |  swarmy_ui                         |            |
|                |  Sign in to your workspace         |            |
|                |                                    |            |
|                |  Username                          |            |
|                |  +------------------------------+  |            |
|                |  | admin                        |  |            |
|                |  +------------------------------+  |            |
|                |                                    |            |
|                |  Password                          |            |
|                |  +------------------------------+  |            |
|                |  | ********                     |  |            |
|                |  +------------------------------+  |            |
|                |  [error text, when present]        |            |
|                |                                    |            |
|                |  +------------------------------+  |            |
|                |  |         Sign in              |  |            |
|                |  +------------------------------+  |            |
|                +------------------------------------+            |
|                                                                  |
+------------------------------------------------------------------+
```

### 2.2 Agents (`/agents`)

The landing view. A filterable table of saved agent compositions with thread counts; row click opens the composition canvas at `/agents/:id`. Filter chips use the accent-selected surface.

```
+--------+----------------------------------------------------------+
|        |  Agents (3)                          [+ New Agent]       |
| Sidebar|  [ All ] [ AI+Human ] [ Dual AI ]                        |
|  nav   |  +----------------------------------------------------+  |
|        |  | Title              | Threads | Type     | Sides    |  |
|        |  |--------------------+---------+----------+----------|  |
|        |  | fraud_review_agent |   12    | Dual AI  | A risk.. |  |
|        |  |                    |         |          | B cust.. |  |
|        |  | inventory_check... |    3    | Dual AI  | A .. B ..|  |
|        |  | order_support_a... |   27    | AI+Human | A agent  |  |
|        |  +----------------------------------------------------+  |
|        |                                                          |
+--------+----------------------------------------------------------+
```

### 2.3 Composition (`/agents/:id`)

The workspace for one agent: toolbar on top, structure tree rail left (280px / 48px collapsed), canvas viewport center, contextual inspector right (320px, hidden until selection). Owns only route wiring; canvas behavior lives in the canvas spec (Section 3).

```
+--------+---------------------------------------------------------------------+
|        | Toolbar: <- Agents  fraud_review_agent  [Dual AI]  [Run] [Pack v]   |
| Sidebar+----------+-------------------------------------------------+--------+
|  nav   |STRUCTURE |                CANVAS                           |INSPECT.|
|        | [search] |                                                 |        |
|        | Agent    |         (side A)----(agent)----(model)          | Node:  |
|        |  - Sides |              \        |                         | model  |
|        |  - Model |               \    (tool) (tool)                | prov.. |
|        |  - Tools |                \                                | caps.. |
|        |  - Hooks |                 (side B)                        | vars.. |
|        | Threads  |                                                 |        |
|        |  3f9a1c  |                        [zoom: - 100% + |fit|]   |        |
|        |<resizer> |                                                 |<resiz> |
|        +----------+-------------------------------------------------+--------+
```

### 2.4 Threads (`/threads`)

The audit/history surface: server-side search, agent filter, and date filter above a list of full-width thread rows with status badges and relative times. Row click opens the thread inspector.

```
+--------+----------------------------------------------------------+
|        |  Threads                                    [+ New]      |
| Sidebar|  +------------------+ +--------------+ +---------------+ |
|  nav   |  | Search threads.. | | Agent: All v | | Date: Any v   | |
|        |  +------------------+ +--------------+ +---------------+ |
|        |  +----------------------------------------------------+  |
|        |  | o RUNNING  order_support_agent   3f9a1c..  2m ago  |  |
|        |  |            14 messages                        >     |  |
|        |  |----------------------------------------------------|  |
|        |  | o DONE     fraud_review_agent    5b7d70..  2h ago  |  |
|        |  |            9 messages                         >     |  |
|        |  |----------------------------------------------------|  |
|        |  | o DONE     inventory_check_...   540aea..  1d ago  |  |
|        |  |            7 messages                         >     |  |
|        |  +----------------------------------------------------+  |
|        |        [< Prev]   Page 1 of 4   [Next >]               |
+--------+----------------------------------------------------------+
```

### 2.5 Thread Inspector (`/threads/:id`)

The deepest inspection surface. A header strip (identity, status badge, stat pills, actions) above six lazily-mounted tabs: Messages, Logs, Files, KV Store, Effects, Cost. Live threads stream over WebSockets; terminated threads render REST snapshots.

```
+--------+----------------------------------------------------------------+
|        | <- Threads   fraud_review_agent / 5b7d70b6.. [Copy] [Stop v]  |
| Sidebar|  Status: TERMINATED   9 messages   4 logs   $0.000556   2h ago |
|  nav   | +--------------------------------------------------------------+
|        | | Messages | Logs (4) | Files | KV Store (2) | Effects | Cost |
|        | +--------------------------------------------------------------+
|        | |                                                              |
|        | |   [active tab panel, role="tabpanel"]                        |
|        | |                                                              |
|        | |                                                              |
|        | +--------------------------------------------------------------+
+--------+----------------------------------------------------------------+
```

Messages tab detail:

```
+------------------------------------------------------------------+
| [user]                                    2h ago                 |
|  { "orderId": "A-1002" }                                         |
|------------------------------------------------------------------|
| [assistant] Risk Analyst                          $0.0002  2h ago|
|  tool call: check_customer_history({...})                        |
|------------------------------------------------------------------|
| [tool] check_customer_history                                    |
|  { "history": [...] }                                 [JSON]     |
|------------------------------------------------------------------|
| [system] SILENT                                                  |
|  persistent thread arguments                                     |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| | Message the thread...                              [Send]    | |
| +--------------------------------------------------------------+ |
```

### 2.6 Marketplace (`/marketplace`)

Two-pane browser for agent packs: searchable card grid on the left, rendered README + metadata detail on the right, with an install bar when a pack is selected. Card hover raises `shadow-sm` to `shadow-md`.

```
+--------+--------------------------------------------------------------+
|        |  Marketplace                                                 |
|        |  [Search packages...                         ]               |
| Side   |+---------------------------+--------------------------------+|
| bar    || +---------+ +---------+   |  acme/support-agent-pack       ||
|        || | pack    | | pack    |   |  v1.2.0 - by acme              ||
|        || | card    | | card    |   |  [Install]                     ||
|        || +---------+ +---------+   |  -----------------------------  ||
|        || +---------+ +---------+   |  README (markdown rendered)    ||
|        || | pack    | | pack    |   |  # Support Agent Pack          ||
|        || +---------+ +---------+   |  This pack contains...         ||
|        |+---------------------------+--------------------------------+|
+--------+--------------------------------------------------------------+
```

### 2.7 Models (`/models`)

Catalog of configured AI models. DataTable with search and row actions; `ModelModal` handles create/edit (provider autocomplete, model search, capability badges). Rows expand to a copyable curl command.

```
+--------+--------------------------------------------------------------+
|        |  Models                                    [+ Add Model]     |
|        |  Configure the AI models available to your agents.           |
| Side   |  [Search models...                            ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name        | Provider   | Model ID          | Actions   | |
|        | |-------------+------------+-------------------+-----------| |
|        | | default     | openrouter | deepseek/deepseek | Edit Del  | |
|        | | gpt-4o      | openai     | gpt-4o            | Edit Del  | |
|        | +----------------------------------------------------------+ |
|        |  < 1 2 3 >                                                   |
+--------+--------------------------------------------------------------+

ModelModal (overlay):
+--------------------------------------------------+
| Add Model                                      X |
|--------------------------------------------------|
| Provider*    [ autocomplete.................v ]  |
| Model*       [ search available models....... ]  |
|              | gpt-4o                          | |
|              | gpt-4o-mini                     | |
|              [ Load more ]                     |
| Name         [ ______________________________ ]  |
| Capabilities [text] [vision] [tools]  (badges)   |
| Endpoints    /chat/completions  (list)           |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

### 2.8 Providers (`/providers`)

Connection settings and credentials for AI providers. Status column uses success/warning/danger badge semantics; editing opens a schema-driven form modal with a Test Connection action.

```
+--------+--------------------------------------------------------------+
|        |  Providers                                                   |
|        |  Connect AI providers and manage credentials.                |
| Side   |  [Search providers...                         ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Icon | Name      | Status      | Models | Actions        | |
|        | |------+-----------+-------------+--------+----------------| |
|        | | (o)  | openai    | configured  | 12     | Edit           | |
|        | | (a)  | anthropic | missing key | 0      | Edit           | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

Edit modal:
+--------------------------------------------------+
| Configure openai                               X |
|--------------------------------------------------|
| API Key*     [ ****************************** ]  |
| Base URL     [ https://api.openai.com/v1______ ]  |
| Organization [ ______________________________ ]  |
|--------------------------------------------------|
|        [Test Connection]       [Cancel] [Save]   |
+--------------------------------------------------+
```

### 2.9 Prompts (`/prompts`)

The prompt library. Table of reusable prompt templates with variable counts; row click opens the full editor, the primary action opens `PromptModal` for quick create.

```
+--------+--------------------------------------------------------------+
|        |  Prompts                                  [+ New Prompt]     |
|        |  Reusable prompt templates for your agents.                  |
| Side   |  [Search prompts...                           ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name              | Variables | Updated    | Actions     | |
|        | |-------------------+-----------+------------+-------------| |
|        | | support-agent     | 3         | 2024-05-01 | Edit Del    | |
|        | | refund-policy     | 1         | 2024-04-28 | Edit Del    | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

### 2.10 Prompt Editor (`/prompts/:id`)

Full editor for one prompt: Monaco editor left (flex-grow), metadata + variables panel right (~320px), sticky header with name, dirty indicator, and Save/Delete. Route-leave guard protects unsaved changes.

```
+--------+--------------------------------------------------------------+
|        | < Prompts | support-agent        (unsaved)   [Save] [Delete] |
| Side   |+---------------------------------------+--------------------+|
| bar    ||                                       | Metadata           ||
|        ||  You are a helpful support            | Name* [support.. ] ||
|        ||  agent for {{company}}.               | Desc  [textarea..] ||
|        ||                                       |                    ||
|        ||  Answer questions about               | Variables          ||
|        ||  {{topic}} using the docs.            | +----------------+ ||
|        ||                                       | | company  text  | ||
|        ||  [ Monaco editor ]                    | | topic    text  | ||
|        ||                                       | +----------------+ ||
|        ||                                       | [+ Add variable]   ||
|        |+---------------------------------------+--------------------+|
+--------+--------------------------------------------------------------+
```

### 2.11 Tools (`/tools`)

Tool catalog management. Rows expand inline to show the description and a `JsonViewer` of the schema; create/edit happens in a modal with a JSON code editor and key/value variable rows.

```
+--------+--------------------------------------------------------------+
|        |  Tools                                     [+ Add Tool]      |
|        |  Tools your agents can call during a run.                    |
| Side   |  [Search tools...                             ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Name                  | Type | Variables | Actions       | |
|        | |-----------------------+------+-----------+---------------| |
|        | | check_refund_policy   | tool | 0         | View Edit Del | |
|        | | close_ticket          | tool | 2         | View Edit Del | |
|        | +----------------------------------------------------------+ |
|        |  Expanded row:                                               |
|        |  +--------------------------------------------------------+  |
|        |  | Description: Check whether an order qualifies...       |  |
|        |  | Schema: { "type": "object", ... }      [JsonViewer]    |  |
|        |  +--------------------------------------------------------+  |
+--------+--------------------------------------------------------------+

Tool modal:
+--------------------------------------------------+
| Edit Tool                                      X |
|--------------------------------------------------|
| Name*        [ check_refund_policy___________ ]  |
| Description  [ textarea....................... ]  |
| Schema       [ code editor (JSON) ............ ]  |
| Variables    [ key/value rows... ] [+ Add]       |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

### 2.12 Variables (`/variables`)

Scoped key/value management (Instance / Agents / Prompts / Tools tabs). Editable `scoped-env-row` grid (key, value, type toggle, delete) with a sticky Save footer; secrets are masked.

```
+--------+--------------------------------------------------------------+
|        |  Variables                                                   |
|        |  [Instance] [Agents] [Prompts] [Tools]        scope: agents  |
| Side   |  Agent: [ support-agent v ]                                  |
| bar    | +----------------------------------------------------------+ |
|        | | Key              | Value            | Type   |           | |
|        | |------------------+------------------+--------+-----------| |
|        | | COMPANY_NAME     | Acme Inc         | text   | [x]       | |
|        | | REFUND_API_TOKEN | **************** | secret | [x]       | |
|        | | [+ Add variable]                                    [Save]| |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

### 2.13 Users (`/users`, admin only)

User management for admins. Small create/edit modal (username, password, role radios); the current admin's row hides Delete; rows expand to show env keys with masked secrets.

```
+--------+--------------------------------------------------------------+
|        |  Users                                     [+ Add User]      |
|        |  Manage who can access this workspace.                       |
| Side   |  [Search users...                             ]              |
| bar    | +----------------------------------------------------------+ |
|        | | Username    | Role        | Actions                      | |
|        | |-------------+-------------+------------------------------| |
|        | | admin       | admin       | Edit                         | |
|        | | jane        | user        | Edit Delete                  | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

User modal:
+--------------------------------------------------+
| Add User                                       X |
|--------------------------------------------------|
| Username*    [ ______________________________ ]  |
| Password*    [ ______________________________ ]  |
| Role*        ( ) user   ( ) admin                |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

### 2.14 API Keys (`/api-keys`)

Programmatic access keys. Table of existing keys plus a create dialog; the created key is shown exactly once in a reveal dialog (mono font on a mute surface) with a copy button.

```
+--------+--------------------------------------------------------------+
|        |  API Keys                             [+ Create Key]         |
|        |  Keys for accessing the API programmatically.                |
| Side   | +----------------------------------------------------------+ |
| bar    | | Name      | Prefix   | Created    | Last used  | Actions | |
|        | |-----------+----------+------------+------------+---------| |
|        | | ci-deploy | sw_sk_a1 | 2024-05-01 | 2024-05-20 | Revoke  | |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+

Reveal modal (shown once after create):
+--------------------------------------------------+
| Key created                                    X |
|--------------------------------------------------|
| Copy this key now. It will not be shown again.   |
| +----------------------------------------------+ |
| | sw_sk_a1b2c3d4e5...                 [Copy]   | |
| +----------------------------------------------+ |
|                                         [Done]   |
+--------------------------------------------------+
```

---

## Section 3: Composition Canvas

The graph workspace inside `/agents/:id`. The layout generator decides real positions; these frames show anatomy, not coordinates.

### 3.1 Composition view layout

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

### 3.2 Canvas anatomy (dual-AI agent)

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

### 3.3 Node cards

AgentNode (root):

```
+--------------------------------------+
| [icon]  fraud_review_agent           |
|         DUAL AI - 2 sides            |
|  A: Risk Analyst   B: Customer Adv.  |
|  vars: orderId* (string)             |
+--------------------------------------+
```

SidePromptNode (AI mode):

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

SidePromptNode (human mode):

```
+----------------------+
| B  Human Receiver    |
| [person icon]        |
| waits for user input |
+----------------------+
```

ToolNode variants:

```
FunctionToolCard:            PromptCard (as tool):        AgentLockupCard (handoff):
+------------------+         +------------------+         +----------------------+
| [fx] check_hist  |         | [doc] summarize  |         | [->] escalate_agent  |
| function tool    |         | prompt tool      |         | handoff              |
| in: 2 - out: 1   |         | model: default   |         | target: human_queue  |
+------------------+         +------------------+         +----------------------+
```

HookNode:

```
+------------------+
| [zap] on_message |
+------------------+
```

ModelNode:

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

### 3.4 Floating controls

```
bottom-right of canvas:
+-----+-----+-------+-----+------+
|  -  | 100%|   +   | fit | lock |
+-----+-----+-------+-----+------+
```

`lock` lights up when the auto-fit lock is set (user has manually panned/zoomed).

### 3.5 Inspector panel (right, contextual)

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

### 3.6 Edit surface (overlay)

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

### 3.7 Pack modal flow

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

### 3.8 Structure tree (alternative view)

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

---

## Section 4: Components

### 4.1 Sidebar

Primary navigation rail. Hosts the logo, top-level nav (Agents, Marketplace, Models, Providers), the current-agent selector with section shortcuts (Threads, Structure), docs link, theme toggle, and the user/logout section. Collapses from `w-60` to a `w-16` icon rail with tooltips.

```
+----------------+        +-----+
| [logo]         |        | [l] |   collapsed icon rail
|----------------|        |-----|
| > Agents   (3) |        |  >  |
|   Threads      |        |  o  |
|   Structure    |        |  o  |
| o Marketplace  |        |  o  |
| o Models       |        |  o  |
| o Providers    |        |     |
|----------------|        |-----|
| [agent avatar v]        | [a] |   agent selector (dropdown when collapsed)
| [Threads] [Structure]   |     |
|----------------|        |-----|
| docs           |        |  ?  |
| [theme toggle] |        | [t] |
| user [logout]  |        | [u] |
+----------------+        +-----+
```

Active items show an accent icon and a filled surface; section shortcuts highlight with an accent left border. Badge counts render next to labels and hide when collapsed.

### 4.2 Modal

The shared dialog shell behind every create/edit workflow. Backdrop click and Escape close it; `hasChanges` routes closes through an unsaved-changes confirm. Body scroll locks while open. Below the `500px` container query the card goes full-width and the footer stacks.

```
+------------------------------------------------------------------+
| dimmed backdrop (bg-black/50, dark: bg-black/80)                 |
|        +--------------------------------------------------+      |
|        | Title                                        [x] |      |
|        |--------------------------------------------------|      |
|        |                                                  |      |
|        |   (default slot: form / content)                 |      |
|        |                                                  |      |
|        |--------------------------------------------------|      |
|        |                          [Cancel] [Save]  footer |      |
|        +--------------------------------------------------+      |
+------------------------------------------------------------------+
```

Card surface `--color-background-soft`, border `--color-border`, radius `--radius-xl`, elevation `shadow-xl`. Default width `max-w-lg`, min height `min-h-[24rem]`, both overridable per use via props.

### 4.3 DataTable

The workhorse of every list/CRUD view: header (title, description, primary action), debounced client-side search, column sorting, row actions with optional confirm, bulk actions, expandable rows, and loading/empty states.

```
+--------------------------------------------------------------+
| Title (n)                              [+ Primary Action]    |
| Description text at muted opacity                            |
| [Search...                                   ]               |
| +----------------------------------------------------------+ |
| | Col A ^     | Col B      | Col C           | Actions     | |  <- header on background-mute
| |-------------+------------+-----------------+-------------| |
| | value       | value      | value           | Edit  Del   | |
| | value       | value      | value           | Edit  Del   | |  <- hover: border-hover tint
| |----------------------------------------------------------| |
| | > expanded row content (slot)                            | |
| +----------------------------------------------------------+ |
| [x] 2 selected            [Bulk Action] [Delete]             |  <- when selectable
+--------------------------------------------------------------+
```

Loading renders skeleton rows; empty renders the `emptyMessage` with an inbox icon. Row actions with `confirm: true` open an internal ConfirmDialog first.

### 4.4 ModelModal

Create/edit dialog for model entries, built on `Modal` with unsaved-changes guarding. Header shows an eyebrow label ("ADD MODEL" / "EDIT MODEL") plus the model name when editing. Supports an `inline` mode for embedding in side panes, and a `readonly` mode that disables every input and hides Save.

```
+--------------------------------------------------+
| ADD MODEL                                      X |
|--------------------------------------------------|
| Provider*    [ autocomplete.................v ]  |
| Model*       [ search available models....... ]  |
|              | gpt-4o                          | |
|              | gpt-4o-mini                     | |
|              [ Load more ]                     |
| Name         [ ______________________________ ]  |
| Max ctx [1048576]   Max out [393216]  (step 1k)  |
| Params     temperature [1.0]  top_p [1.0]        |
| Capabilities [x]streaming [x]tools [ ]vision []json |
|--------------------------------------------------|
|                              [Cancel] [Save]     |
+--------------------------------------------------+
```

Option lists (providers, available models, capabilities, endpoints) fetch on open and cache for the session; the eyebrow label uses `--color-neutral-400` with `--tracking-eyebrow`.

### 4.5 PromptModal

Create/edit dialog for prompt templates, built on `Modal`. The content editor live-scans for `{{variable}}` placeholders; detected variables appear in the variables panel, and undeclared-but-used or declared-but-unused variables surface as warnings. Container queries (`edit-sections-query` / `edit-sections-stack`) switch the body between side-by-side and stacked layouts.

```
wide (side by side):                          narrow (stacked, < 500px card):
+--------------------------------------------------+   +---------------------------+
| Edit Prompt                                    X |   | Edit Prompt             X |
|--------------------------------------------------|   |---------------------------|
| Name*  [ support-agent______________________ ]   |   | Name*  [ support-agent_ ] |
| +----------------------+ +---------------------+ |   | +-----------------------+ |
| | Content              | | Variables           | |   | | Content               | |
| | You are a helpful    | | +-----------------+ | |   | |  (multiline editor)   | |
| | agent for {{company}}| | | company text    | | |   | +-----------------------+ |
| | ...                  | | | topic   text    | | |   | Variables               |
| +----------------------+ | +-----------------+ | |   | +-----------------+     |
|                          | [+ Add variable]   | |   | | company text    |     |
|--------------------------------------------------|   | +-----------------+     |
|                              [Cancel] [Save]     |   |---------------------------|
+--------------------------------------------------+   |        [Cancel]           |
                                                       |        [Save]             |
                                                       +---------------------------+
```

Variable-detected highlights use the accent token pair (`--accent-100`/`--accent-700` light, `--accent-900`/`--accent-300` dark); placeholder chips render in `--font-mono`. Save validates name (required, unique) and non-empty content before emitting `save` to the parent.
