# ADR-002: FormKit Replacement with shadcn-vue

- Status: Accepted
- Context: swarmy_ui has many schema-driven forms (agent settings, prompt editing, thread variables) and needs advanced inputs: autocomplete, datepicker, toggle, unit (numeric with units), tag list, repeater, and more. FormKit Pro provides these but is a paid license that cannot be redistributed, and the FormKit free core still creates a dependency on FormKit's schema system for every form in the app.

## Decision

Drop FormKit entirely - both the paid Pro inputs and the free core. Build forms on:

- **shadcn-vue** for UI components: copy-paste component source built on Reka UI headless primitives, styled with Tailwind. The components live in our repo (`src/components/ui/`), so we own them.
- **VeeValidate + Zod** for form state, validation, and schema. Zod schemas define shape and rules; `@vee-validate/zod` binds them to form components.

## Pro input mapping

| Needed input | shadcn-vue component | Reka UI primitive |
|---|---|---|
| Autocomplete | Combobox | Autocomplete |
| Datepicker | Calendar + Popover | DatePicker |
| Toggle | Switch | Switch |
| Unit (number + unit) | NumberField | NumberField (supports `formatOptions` for units) |

## Why shadcn-vue

- **Ownership**: components are copy-pasted into our repo, not installed as a dependency. There is no vendor to upgrade, license, or route around.
- **Headless foundation**: every component is built on Reka UI primitives, which handle accessibility (focus management, keyboard navigation, ARIA) while leaving rendering to us.
- **Tailwind styling**: components style through Tailwind utilities, so our token system (ADR-001) fully controls appearance - no unstyled-mode bridging or theme reconciliation layer needed.
- **No form-framework lock-in**: there is no runtime dependency on a form framework for rendering; VeeValidate is only state and validation and can be swapped independently of the components.

## Form structure

Form schemas are written as Zod schemas and bound with VeeValidate:

```ts
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1),
    temperature: z.number().min(0).max(2),
    model: z.string(),
  })
);

const { handleSubmit, defineField } = useForm({ validationSchema: schema });
```

Form wrappers (`UiFormField`, `UiLabel`, `UiHelpText`, `UiErrorText`) compose the shadcn-vue components and wire VeeValidate field state, so feature forms stay declarative.

## Swappability

Because the components live in our repo (Seam 2 in ADR-007), any single component can be swapped, forked, or restyled without affecting domain components (ModelCard, AgentCard) built on top. VeeValidate and Zod sit behind our form wrappers, so even the validation layer is replaceable at one seam.

## Alternatives considered

1. **FormKit Pro paid license** - rejected: cannot redistribute; dev-only free tier does not cover production.
2. **FormKit core + PrimeVue via `@sfxcode/formkit-primevue`** - rejected: still depends on FormKit's schema system and adds a widget-styling reconciliation layer against our tokens.
3. **Naive UI schema forms** - rejected: replaces one framework dependency with another and fights the token system.

## Consequences

- Form schemas must be rewritten from FormKit schema format to Zod schemas plus VeeValidate form bindings. This is real migration work, but it removes every FormKit dependency from the project.
- Adds `reka-ui`, `vee-validate`, `@vee-validate/zod`, `zod`, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-vue-next` dependencies. shadcn-vue itself is not a dependency - its components are vendored source in `src/components/ui/`.
- All advanced inputs are ours: fixes and extensions land directly in the repo.
