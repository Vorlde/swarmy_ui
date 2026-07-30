// Ported from rebuild/ Gen-1; to be reworked against replica specs.
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { setUnauthorizedHandler } from "@/lib/api";
import LoginView from "@/views/LoginView.vue";
import CompositionView from "@/views/CompositionView.vue";
import ThreadsView from "@/views/ThreadsView.vue";
import PromptsView from "@/views/PromptsView.vue";
import PromptEditView from "@/views/PromptEditView.vue";
import ModelsView from "@/views/ModelsView.vue";
import ProvidersView from "@/views/ProvidersView.vue";
import ToolsView from "@/views/ToolsView.vue";
import MarketplaceView from "@/views/MarketplaceView.vue";
import UsersView from "@/views/UsersView.vue";
import ApiKeysView from "@/views/ApiKeysView.vue";
import VariablesView from "@/views/VariablesView.vue";

const base = import.meta.env.VITE_BASE_PATH || "/";

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    { path: "/", redirect: { name: "agents" } },
    { path: "/login", name: "login", component: LoginView, meta: { public: true } },
    { path: "/agents", name: "agents", component: CompositionView },
    { path: "/threads", name: "threads", component: ThreadsView },
    { path: "/threads/:id", name: "thread-detail", component: ThreadsView },
    { path: "/prompts", name: "prompts", component: PromptsView },
    { path: "/prompts/:id", name: "prompt-edit", component: PromptEditView },
    { path: "/models", name: "models", component: ModelsView },
    { path: "/providers", name: "providers", component: ProvidersView },
    { path: "/tools", name: "tools", component: ToolsView },
    { path: "/marketplace", name: "marketplace", component: MarketplaceView },
    { path: "/marketplace/:name(.*)", name: "marketplace-package", component: MarketplaceView },
    { path: "/settings/users", name: "users", component: UsersView },
    { path: "/settings/my-variables", name: "my-variables", component: VariablesView },
    { path: "/settings/instance-variables", name: "instance-variables", component: VariablesView },
    { path: "/settings/api-keys", name: "api-keys", component: ApiKeysView },
  ],
});

setUnauthorizedHandler(() => {
  const auth = useAuthStore();
  auth.setToken(null);
  auth.user.value = null;
  router.push({ name: "login" });
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!to.meta.public) {
    const ok = await auth.checkSession();
    if (!ok) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }
  if (to.name === "login" && auth.isAuthenticated.value) {
    return { name: "agents" };
  }
});

export default router;
