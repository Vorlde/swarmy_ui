# InspectorPanel

Project: **swarmy_ui**. Contextual editor panel.

> **Placement correction.** The inspector is not adjacent to the canvas. In the live app it is the third
> column of cascade **snap section 2** (Threads + Messages + Inspector) and is driven by the selected
> *thread*, with the tab strip `Logs` (default) / `Files` / `KV Store` / `Effects` /
> `Agent Configuration` / `Thread Settings` - collapsing behind a `...` overflow button when the column
> is narrower than the strip. The canonical spec for that surface is under `specs/views/`. No
> canvas-node-driven inspector appears in any capture; the entity-edit tab set below is a design
> intent, not observed behaviour. Selecting a canvas node must not be specced as opening this panel
> until a capture shows it.

## Purpose

Shows a tabbed form for the selected entity: Inspect (read-only summary), plus an edit tab per entity type (Agent, Prompt, Model, Tool, Hook). Saves go through the shared entity endpoints and then trigger a composition refresh.

## Props

```ts
interface Props {
  node: CanvasNode | null;
  defaultTab?: string;      // from EditTarget.defaultToolTab / section
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `close` | - | x button / Escape |
| `saved` | `{ entityType: string; entityId: string }` | a save succeeds (parent bumps `refreshEpoch`) |

## Slots

| Slot | Purpose |
|---|---|
| `tab-<type>` | override the edit form for an entity type |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/prompts/{name}` | prompt tab open |
| `GET /api/providers` | model tab open (provider select options) |
| entity save endpoints (`PUT/POST` on agents/prompts/tools/models/hooks) | Save button |

## Visual behavior

Panel header: "Inspector" + close. Tab bar auto-selects by `node.kind`. Forms are sectioned (general, sides, variables; body/schema/variables for prompts). Dirty tracking: Save enables only when dirty; Cancel resets. Server validation errors render inline under fields.

## States

- **Loading**: form skeleton while entity detail loads; Save button shows spinner during the request.
- **Empty**: `node === null` renders nothing (parent hides the panel).
- **Error**: load failure shows inline error with retry; save failure keeps form state and shows the server message.

## Theming

Panel width, tab bar style (underline vs pills), form control chrome, and section header typography are all tokens. The `tab-<type>` slots let a theme replace whole forms while keeping the save/refresh contract.
