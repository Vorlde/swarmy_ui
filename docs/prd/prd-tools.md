# PRD: Tools

Feature area: tool management, function tools.

## User stories

- As a builder, I can see all available tools with their type and source
  provider.
- As a builder, I can open a tool to inspect its definition (name,
  description, input schema).
- As a builder, I can see which provider supplies a tool and jump to that
  provider's tool list.
- As a builder, I can see which variables a tool expects so I can configure
  its environment.

## Functional requirements

1. ToolsView: DataTable of tools (name, type, provider), search/filter.
2. Tool detail: full definition view with the input schema rendered in a
   JsonViewer or highlighted code block.
3. Function tools: show the function source/signature where available.
4. Provider linkage: from a tool to `GET /api/providers/:name/tools`.
5. Variables linkage: show variables expected by the tool.

## Non-functional requirements

- Large JSON schemas must render read-only with collapsible nodes
  (JsonViewer), not raw text.
- All appearance via shared primitives and tokens.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/tools` | List tools |
| GET | `/api/tools/:name` | Tool detail |
| GET | `/api/providers/:name/tools` | Tools supplied by a provider |
| GET | `/api/variables/tools/:name` | Variables expected by a tool |

## Acceptance criteria

- Tools table lists all tools with type/provider and supports search.
- Opening a tool shows its full definition with the schema rendered
  read-only and collapsible.
- Provider link navigates to a filtered provider-tools view.
- Expected variables are listed per tool.
- Loading, empty, and error states use UiEmptyState.
