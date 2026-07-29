# PRD: Prompts

Feature area: prompt library, prompt editing.

## User stories

- As a builder, I can browse a library of reusable prompts.
- As a builder, I can open a prompt and edit its content in a full code
  editor with syntax highlighting.
- As a builder, I can see which template environment variables a prompt
  expects.
- As a builder, I can create a new prompt through a guided modal.
- As a builder, I can see which variables a prompt references so I can supply
  them when composing an agent.

## Functional requirements

1. PromptsView: DataTable/list of prompts with search; row opens
   PromptEditView.
2. PromptEditView: Monaco editor for prompt content with Shiki/Monaco theme
   consistent with app tokens; save with optimistic feedback.
3. PromptModal: shadcn-vue + VeeValidate form for creating a prompt (name,
   description, initial content) with Monaco for the content field and Zod
   validation.
4. Template envs: fetch and display expected template variables per prompt.
5. Variables linkage: show variables referenced by the prompt.

## Non-functional requirements

- Monaco and its workers must be code-split so the prompts list loads fast.
- The editor theme must derive from design tokens (light/dark).
- Editor state must not be lost on accidental navigation (dirty guard).

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/prompts` | List prompts |
| GET | `/api/prompts/:name` | Prompt detail |
| GET | `/api/prompts/:name/tenvs` | Template env vars expected by a prompt |
| GET | `/api/variables/prompts/:name` | Variables referenced by a prompt |

## Acceptance criteria

- Prompts list renders with search and empty state.
- Opening a prompt loads Monaco with the content, and saving persists it.
- Creating a prompt via the modal adds it to the list without a reload.
- Expected template variables are visible on the prompt detail.
- Navigating away with unsaved changes prompts a confirmation.
