# PRD: Providers

Feature area: provider configuration.

## User stories

- As an admin, I can see all configured providers with their icons.
- As an admin, I can see which tools each provider supplies.
- As an admin, I can identify providers at a glance by their icon in lists
  and selectors across the app.

## Functional requirements

1. ProvidersView: list/table of providers with icon, name, and summary.
2. Provider detail: tools supplied by the provider (linkage to ToolsView).
3. Provider icons: fetched per provider and cached; used in provider
   selectors elsewhere (ModelModal, composition inspector).
4. Provider configuration surface: credentials/settings editing where the
   deployment supports it (via env/config endpoints).

## Non-functional requirements

- Icons must have a graceful fallback when a provider has none.
- Icon responses should be cached client-side to avoid repeated fetches.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/providers` | List providers |
| GET | `/api/providers/:name/icon` | Provider icon |
| GET | `/api/providers/:name/tools` | Tools supplied by a provider |
| GET | `/api/config` | Instance config (provider-related settings) |
| GET/PATCH | `/api/envs/instance` | Instance env (provider credentials) |

## Acceptance criteria

- Providers list renders with icons (or fallback) for every provider.
- Opening a provider shows its supplied tools and links to the tools view.
- The same icon component is reused in model and composition selectors.
- Updating instance env reflects without an app restart where the backend
  allows it.
