// Route table as data. Paths and names are transcribed from the live app and
// are reference material - do not "tidy" them.
//
// Each record names a view id instead of importing a component, so routes are
// declared once in core and satisfied later by whichever feature plug
// registers that id (see src/plugins/registry.ts, ADR-008).

export interface RouteDef {
  path: string;
  name: string;
  /** View id looked up in the `views` registry. */
  view: string;
  meta?: { public?: boolean };
}

export const routeDefs: RouteDef[] = [
  { path: "/login", name: "login", view: "login", meta: { public: true } },

  // `/agents` is the cascade shell, not a standalone list. Selection lives in
  // the query string: /agents?agent=<name>&thread=<uuid>.
  { path: "/agents", name: "agents", view: "composition" },

  { path: "/threads", name: "threads", view: "threads" },
  { path: "/threads/:id", name: "thread-detail", view: "threads" },

  { path: "/prompts", name: "prompts", view: "prompts" },
  // Renders PromptsView with the Edit Prompt modal open over it.
  { path: "/prompts/:id", name: "prompt-edit", view: "prompt-edit" },

  { path: "/models", name: "models", view: "models" },
  { path: "/providers", name: "providers", view: "providers" },
  { path: "/tools", name: "tools", view: "tools" },

  { path: "/marketplace", name: "marketplace", view: "marketplace" },
  { path: "/marketplace/:name(.*)", name: "marketplace-package", view: "marketplace" },

  { path: "/settings/users", name: "users", view: "users" },
  { path: "/settings/my-variables", name: "my-variables", view: "variables" },
  { path: "/settings/instance-variables", name: "instance-variables", view: "variables" },
  { path: "/settings/api-keys", name: "api-keys", view: "api-keys" },
];

export const rootRedirect = { path: "/", redirect: { name: "agents" } } as const;
