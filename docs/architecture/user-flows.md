# swarmy_ui - User Flows

Project: **swarmy_ui**. Mermaid flowcharts for the primary user journeys. Decision nodes are drawn as `{ }` branches; every flow assumes the routing contract in [routing.md](./routing.md) (all routes guarded except `/login`, `/users` admin-only).

## 1. Authentication Flow

Covers app boot, login, session validation, and logout.

```mermaid
flowchart TD
    Start([User opens app]) --> Guard{Route public?}
    Guard -->|Yes: /login| LoginPage[Render LoginView]
    Guard -->|No| Session[checkSession: GET /api/auth/me]
    Session --> SessOK{Session valid?}
    SessOK -->|Yes| Admin{Route needs admin?}
    SessOK -->|No| Redirect[Redirect to /login<br/>preserve ?redirect= path]
    Admin -->|No| View[Render guarded view]
    Admin -->|Yes| Role{user.role == admin?}
    Role -->|Yes| View
    Role -->|No| Home[Redirect to / agents]
    Redirect --> LoginPage
    LoginPage --> HasSess{Already authenticated?}
    HasSess -->|Yes| Agents1[Redirect to /agents]
    HasSess -->|No| Form[Show login form]
    Form --> Submit[Submit credentials<br/>POST /api/auth/login]
    Submit --> CredOK{200 with token + user?}
    CredOK -->|No| Err[Show error in form<br/>stay on /login]
    Err --> Form
    CredOK -->|Yes| Store[Store token, hydrate user]
    Store --> Dest{?redirect= present?}
    Dest -->|Yes| Deep[Navigate to preserved deep link]
    Dest -->|No| Agents1
    Deep --> View
    Agents1 --> View
    View --> ApiCall[Any /api/* request]
    ApiCall --> UNA{401 response?}
    UNA -->|Yes| Clear[Clear token + user<br/>redirect to /login]
    UNA -->|No| View
    View --> Logout[User clicks logout]
    Logout --> Mode{Hosted mode?}
    Mode -->|Self-hosted| LO[POST /api/auth/logout]
    Mode -->|Hosted| LR[GET /api/auth/logout<br/>with return_to]
    LO --> Clear
    LR --> Clear
    Clear --> LoginPage
```

## 2. Agent Composition Flow

From the agents list to a saved, packed, published agent.

```mermaid
flowchart TD
    A([/agents list]) --> B{Has agents?}
    B -->|No| Empty[Empty state<br/>+ New agent button]
    Empty --> Create[AgentModal: create agent]
    B -->|Yes| Select[Select agent card]
    Select --> Comp[Navigate /agents/:id<br/>CompositionView]
    Create --> Comp
    Comp --> Mode{Canvas or Structure?}
    Mode -->|Canvas| Canvas[CompositionCanvas<br/>nodes + edges]
    Mode -->|Structure| Tree[StructureTree<br/>recursive rows]
    Tree --> RowClick[Click row] --> Focus[Select + focus node on canvas]
    Canvas --> AddNode[Add node:<br/>side / tool / hook / model / subagent]
    AddNode --> Pick{Existing or new?}
    Pick -->|Existing| Attach[Attach catalog item<br/>prompt/tool/model]
    Pick -->|New| NewModal[Open PromptModal /<br/>ModelModal / tool editor]
    NewModal --> SaveNew[Save -> new catalog item] --> Attach
    Attach --> Connect[Connect nodes:<br/>solid structural / dashed model edge]
    Connect --> Inspect{Edit node?}
    Inspect -->|Yes| Pane[Inspector pane opens<br/>tab auto-selected by node type]
    Pane --> EditSurface{Needs full editor?}
    EditSurface -->|Yes| ES[EditSurface overlay:<br/>prompt body / schema / variables]
    ES --> PaneSave[Save edits]
    EditSurface -->|No| PaneSave
    PaneSave --> Dirty{Layout dirty?}
    Inspect -->|No| Dirty
    Dirty -->|Yes| Save[Save agent<br/>PUT /api/agents/:id]
    Dirty -->|No| Next
    Save --> Next{Pack or publish?}
    Next -->|Pack| Pack[PackModal:<br/>name + version + DependencyTree]
    Pack --> Analyze[Analyze dependencies] --> PackOK[Pack -> package file]
    Next -->|Publish| Pub[PublishModal:<br/>npm or custom registry]
    PackOK --> Pub
    Pub --> PubOK{Publish success?}
    PubOK -->|Yes| Done([Package published])
    PubOK -->|No| PubErr[Show error, stay in modal] --> Pub
    Next -->|Neither| Stay[Keep composing]
    Stay --> Canvas
```

## 3. Thread Inspection Flow

From the threads list to live inspection and intervention.

```mermaid
flowchart TD
    A([/threads list]) --> Live[WS /api/events:<br/>thread registry updates]
    Live --> List[Thread list refreshes reactively]
    A --> Filter[Filter / search / date range]
    Filter --> List
    List --> New[CreateThreadModal<br/>pick agent, initial messages]
    New --> Sel
    List --> Sel[Select thread row]
    Sel --> Nav[Navigate /threads/:id<br/>ThreadInspectorView]
    Nav --> Load[GET messages history +<br/>subscribe WS /threads/:id/stream]
    Load --> Tabs[Inspector tabs:<br/>Messages / Logs / Details / DevTools]
    Tabs --> Msg{User action}
    Msg -->|Send message| Send[POST /threads/:id/messages<br/>202 queued]
    Send --> Stream[New frame arrives on WS<br/>append to message list]
    Stream --> Tabs
    Msg -->|View logs| Logs[Logs tab:<br/>REST poll or WS tail]
    Logs --> Tabs
    Msg -->|Control| State{Thread running?}
    State -->|Yes| Stop[Stop thread]
    State -->|No| Ended{Thread state?}
    Ended -->|Paused| Continue[Continue thread]
    Ended -->|Dead/errored| Revive[Revive thread<br/>rehydrate from history]
    Stop --> Updated[Status frame on WS]
    Continue --> Updated
    Revive --> Updated
    Updated --> Tabs
    Msg -->|Back| List
    Msg -->|Deep link| DL[?thread= / ?node= synced<br/>to router query]
    DL --> Tabs
```

## 4. CRUD Management Flow

Shared flow for models, providers, tools, and prompts. All four views are DataTable + modal driven.

```mermaid
flowchart TD
    A([List view: /models /providers /tools /prompts]) --> T[DataTable loads:<br/>GET /api/<resource>]
    T --> B{Action}
    B -->|Create| C[Primary action button<br/>opens modal in add mode]
    B -->|Edit row| E[Row edit action<br/>opens modal in edit mode, hydrated]
    B -->|Delete row| D{Confirm?}
    D -->|Cancel| T
    D -->|Confirm| Del[DELETE /api/<resource>/:id]
    Del --> Refresh[Refresh table data]
    C --> Form[Form in modal<br/>shadcn-vue fields + VeeValidate]
    E --> Form
    Form --> Valid{Client validation OK?}
    Valid -->|No| FErr[Inline field errors] --> Form
    Valid -->|Yes| Submit[POST or PUT /api/<resource>]
    Submit --> SErr{Server error?}
    SErr -->|Yes| AErr[UiAlertBox at top of modal body] --> Form
    SErr -->|No| Close[Close modal + refresh table]
    Close --> Refresh
    Refresh --> T
    B -->|Search / sort| CS[Client-side filter + sort]
    CS --> T
    B -->|Bulk select| Bulk[Bulk action bar] --> BC{Confirm?}
    BC -->|Yes| BulkRun[Run handler on selection] --> Refresh
    BC -->|No| T
    B -->|Prompt: open full editor| PE[Navigate /prompts/:id<br/>PromptEditView with Monaco]
    PE --> PESave[Save] --> A
    Form --> Close2{Close with unsaved changes?}
    Close2 -->|Yes| Guard[ConfirmDialog:<br/>discard changes?]
    Guard -->|Discard| T
    Guard -->|Keep editing| Form
```

## 5. Marketplace Flow

Browse, install (unpack), and publish packages.

```mermaid
flowchart TD
    A([/marketplace]) --> Load[Load package index]
    Load --> B{Action}
    B -->|Search| Search[SearchInputWrapper<br/>debounced filter]
    Search --> Grid[Package grid updates]
    B -->|Browse| Grid
    Grid --> View[Select package card<br/>detail pane: readme, deps, version]
    View --> Inst{Installed?}
    Inst -->|No| Unpack[UnpackModal:<br/>enter package id, inspect UnpackTree]
    Unpack --> Conf{Conflict with existing<br/>prompt/tool/model names?}
    Conf -->|Yes| Toggle[Per-item toggle:<br/>skip or overwrite shared items]
    Conf -->|No| Run[Unpack: create records]
    Toggle --> Run
    Run --> OK{Unpack success?}
    OK -->|Yes| DoneU([Items available in catalogs<br/>agent usable on canvas])
    OK -->|No| UErr[Show errors in modal] --> Unpack
    Inst -->|Yes| Remove[Uninstall / remove package records]
    B -->|Publish| NeedAgent{Start from an agent?}
    NeedAgent -->|Yes| PackFlow[Go to composition:<br/>PackModal -> PublishModal]
    NeedAgent -->|No| PubDirect[PublishModal:<br/>pick package file]
    PackFlow --> Token{npm token configured?<br/>token-status check}
    PubDirect --> Token
    Token -->|Yes| Push[Publish to registry]
    Token -->|No| TokErr[Prompt to add token<br/>in Settings > API keys]
    TokErr --> PubDirect
    Push --> DoneP([Package published<br/>visible in marketplace])
```

## 6. Settings Flow

Users, API keys, and variables management. `/users` is admin-only.

```mermaid
flowchart TD
    A([Sidebar user section]) --> Fly[SidebarSettingsMenu flyout]
    Fly --> Pick{Section}
    Pick -->|Users| Admin{role == admin?}
    Admin -->|No| Block[Router guard redirects to /]
    Admin -->|Yes| Users[UsersView:<br/>table + create/edit/role modals]
    Users --> UAct{Action}
    UAct -->|Create user| UCreate[User modal:<br/>name, email, role]
    UAct -->|Change role| URole[Role select -> PUT /api/users/:id]
    UAct -->|View stream| UStream[Admin view of<br/>/api/users/:id/stream]
    UAct -->|Delete| UDel[ConfirmDialog -> DELETE]
    UCreate --> Saved[Refresh table]
    URole --> Saved
    UDel --> Saved
    Pick -->|API keys| Keys[ApiKeysView:<br/>key list + create]
    Keys --> KAct{Action}
    KAct -->|Create| KCreate[Create key modal:<br/>label + scopes]
    KCreate --> KShown[Secret shown once<br/>CopyButton to clipboard]
    KAct -->|Revoke| KRev[ConfirmDialog -> DELETE key]
    KShown --> Saved
    KRev --> Saved
    Pick -->|Variables| Vars[VariablesView:<br/>key/value table]
    Vars --> VAct{Action}
    VAct -->|Create / edit| VEdit[Variable modal:<br/>name, value, secret flag]
    VAct -->|Delete| VDel[ConfirmDialog -> DELETE]
    VEdit --> Saved
    VDel --> Saved
    Saved --> Pick
```

## 7. Theme Swap Flow

How a user toggles light/dark, and how an admin or deployer swaps the whole skin.

```mermaid
flowchart TD
    subgraph User["User-level toggle"]
        A([User clicks theme toggle<br/>in sidebar]) --> Cur{Current theme?}
        Cur -->|Light| Dark[Apply dark class +<br/>persist to localStorage]
        Cur -->|Dark| Light[Apply light class +<br/>persist to localStorage]
        Dark --> Re[uiStore updates;<br/>tokens resolve via CSS vars<br/>no reload]
        Light --> Re
    end
    subgraph Admin["Admin / deployer-level swap"]
        B([Admin chooses new theme]) --> File[Add theme file in<br/>src/assets/themes/<br/>Tailwind v4 @theme tokens]
        File --> Logo{Rebrand assets?}
        Logo -->|Yes| Slots[Set --logo-url-light / dark<br/>or use sidebar logo slot]
        Logo -->|No| Tokens
        Slots --> Tokens[Token values override:<br/>colors, radii, fonts,<br/>sidebar widths, accent scale]
        Tokens --> Skin{Deeper reskin?}
        Skin -->|No| Ship[Deploy: every view,<br/>modal, and canvas restyles<br/>from tokens only]
        Skin -->|Yes| Prims[Swap Ui* primitive<br/>components only;<br/>views untouched]
        Prims --> Ship
    end
    Re --> Done([Theme applied app-wide])
    Ship --> Done
```

## Notes

- Every guarded navigation re-checks the session; a mid-session 401 anywhere in the API client bounces to `/login` via the global unauthorized handler.
- Deep links (`/agents/:id?thread=<uuid>&node=<id>`) survive the login round trip through the `?redirect=` query param.
- Modals with `hasChanges` always gate close behind a ConfirmDialog; this is uniform across ModelModal, PromptModal, and the CRUD edit surfaces.
