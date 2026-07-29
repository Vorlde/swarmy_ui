# PRD: Variables

Feature area: variable management.

## User stories

- As a builder, I can see which variables each agent, prompt, and tool
  expects, so I can supply values when composing and running agents.
- As an admin, I can manage instance-level environment variables (including
  secrets) for the deployment.

## Functional requirements

1. VariablesView: three-section view (agents, prompts, tools) listing
   expected variables per entity, with search.
2. Per-entity variable listing: name, expected type/default where available,
   and which entity requires it.
3. Instance env editor: get/patch instance env vars, with secret-type values
   masked by default and reveal-on-demand.
4. Linkage: from a variable row to the owning agent/prompt/tool view.

## Non-functional requirements

- Secret values are never rendered in plain text by default; reveal is an
  explicit user action.
- All editing goes through shadcn-vue + VeeValidate forms with Zod
  validation.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/variables/agents/:name` | Variables expected by an agent |
| GET | `/api/variables/prompts/:name` | Variables expected by a prompt |
| GET | `/api/variables/tools/:name` | Variables expected by a tool |
| GET | `/api/agents/:name/tenvs` | Agent template env vars |
| GET | `/api/prompts/:name/tenvs` | Prompt template env vars |
| GET/PATCH | `/api/envs/instance` | Instance env (incl. secrets) |

## Acceptance criteria

- Variables are listed per agent, prompt, and tool with search.
- Instance env can be viewed and patched; secret values are masked by
  default.
- Each variable row links to its owning entity.
- Validation errors from the backend display inline.
