# PRD: Marketplace

Feature area: marketplace browsing.

## User stories

- As a builder, I can browse marketplace packages (agents, tools, prompts)
  with search and filtering.
- As a builder, I can open a package detail page with readme, version, and
  license info.
- As a builder, I can install (unpack) a marketplace package into my local
  environment.
- As a builder, I can publish my own packed agent to the marketplace.
- As a builder on a hosted deployment, my marketplace session is handled
  transparently through the platform proxy.

## Functional requirements

1. MarketplaceView: browsable grid/list of packages with search, category
   filters, and loading/empty states.
2. Package detail: readme rendering, version, license, author, and an
   install action.
3. Install flow: analyze then unpack the package; progress and result
   feedback.
4. Publish entry point: links into the agent pack/publish flow.
5. Platform proxy: all marketplace traffic goes through the platform
   catch-all proxy endpoints; platform session lifecycle handled
   transparently.

## Non-functional requirements

- Package cards and detail layout are shared primitives; re-skinning must be
  a token change.
- Remote content (readme) must be sanitized before rendering.
- Proxy failures must surface as friendly error states, not blank screens.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| ANY | `/api/platform/**` | Marketplace API proxy (GET/POST/PUT/PATCH/DELETE) |
| ANY | `/api/platform-session/**` | Platform session proxy |
| GET | `/api/platform-endpoint` | Resolve the platform endpoint |
| GET | `/api/unpack/:packageId/analyze` | Analyze before install |
| POST | `/api/unpack/:packageId` | Install (unpack) a package |
| POST | `/api/platform-auth/login` / `logout` / `me` | Platform auth (hosted) |

## Acceptance criteria

- Marketplace listing renders packages with search and filters.
- Package detail renders sanitized readme and metadata.
- Installing a package completes and the package appears locally.
- Publish entry navigates into the pack/publish flow for a selected agent.
- Proxy errors show a retryable error state.
