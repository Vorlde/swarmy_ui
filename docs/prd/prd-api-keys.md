# PRD: API Keys

Feature area: API key management.

## User stories

- As an admin on a hosted deployment, I can see all issued API keys.
- As an admin, I can create a new API key and copy it exactly once at
  creation time.
- As an admin, I can revoke (delete) an API key with confirmation.

## Functional requirements

1. ApiKeysView: DataTable of keys (name/label, prefix, created date), with
   create and delete actions.
2. Create flow: modal form; the full key is shown once in a UiCodeBlock with
   CopyButton, with a clear warning that it cannot be shown again.
3. Delete flow: ConfirmDialog before revocation; list refreshes in place.
4. Hosted-only: on local/self-hosted deployments where the endpoints are
   unavailable, the view shows a friendly unsupported state.

## Non-functional requirements

- Full key material is never stored in component state beyond the creation
  dialog lifetime and never logged.
- Key display uses the shared copyable code block primitive.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/api-keys` | List keys (hosted only) |
| POST | `/api/api-keys` | Create a key (hosted only) |
| DELETE | `/api/api-keys/:id` | Revoke a key (hosted only) |

## Acceptance criteria

- Keys list renders on hosted deployments.
- Creating a key shows the full key once, copyable in one click; closing the
  dialog discards it.
- Revoking a key requires confirmation and removes it from the list.
- On deployments without API key support, a clear unsupported empty state is
  shown instead of an error.
