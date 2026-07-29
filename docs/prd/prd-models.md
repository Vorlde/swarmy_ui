# PRD: Models

Feature area: model management, provider configuration.

## User stories

- As an admin, I can see all configured models with their provider and
  capabilities.
- As an admin, I can add a model by searching a provider's available models.
- As an admin, I can inspect a model's capabilities and endpoints before
  wiring it into an agent.
- As an admin, I can copy a ready-to-run curl command for a model to test it
  outside the platform.
- As an admin, I can configure provider credentials and see each provider's
  icon for quick recognition.

## Functional requirements

1. ModelsView: DataTable of models (name, provider, capabilities), search,
   and a ModelModal for create/edit.
2. ModelModal: shadcn-vue + VeeValidate form with provider selector
   (Combobox autocomplete), available
   model picker backed by paginated search, and capability/endpoint display.
3. Model detail: capabilities and endpoints fetched on demand; curl-data
   shown in a UiCodeBlock with CopyButton.
4. Fallbacks: shown from the models list payload (embedded; no dedicated
   endpoint).
5. Provider icons rendered from the provider icon endpoint.

## Non-functional requirements

- Available-model search must debounce input and paginate (`hasNextPage`).
- Modal form inputs use the shared shadcn-vue (Reka UI) components
  (Combobox, Calendar, Switch, NumberField, etc.); no bespoke inputs.
- All tables/modals consume shared primitives.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/models` | List models (includes fallbacks) |
| GET | `/api/models/:name` | Model detail |
| GET | `/api/models/:name/curl-data` | Copyable curl command |
| POST | `/api/models/available` | Search a provider's available models (paged) |
| POST | `/api/models/capabilities` | Model capabilities |
| POST | `/api/models/endpoints` | Model endpoints |
| GET | `/api/providers` | Provider list for selectors |
| GET | `/api/providers/:name/icon` | Provider icon |

## Acceptance criteria

- Models table lists all models with provider and capability badges.
- Searching available models returns paged results and loads more pages.
- Selecting a model shows capabilities and endpoints without a page reload.
- The curl command block renders with syntax highlighting and copies to the
  clipboard in one click.
- The modal validates required fields before submit and shows server errors
  inline.
