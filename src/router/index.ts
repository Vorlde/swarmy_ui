// Ported from rebuild/ Gen-1, then reworked onto the plugin spine (ADR-008):
// the 12 static `@/views/*.vue` imports are gone. Route records come from
// `routes.ts` as data and resolve their component through the `views` registry,
// which feature plugs fill in. Route names, paths and the guard are unchanged.
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { setUnauthorizedHandler } from "@/lib/api";
import { views } from "@/plugins";
import { unregisteredView } from "@/plugins/unregistered-view";
import { routeDefs, rootRedirect } from "./routes";

const base = import.meta.env.VITE_BASE_PATH || "/";

const records: RouteRecordRaw[] = [
  { path: rootRedirect.path, redirect: rootRedirect.redirect },
  ...routeDefs.map(
    (def): RouteRecordRaw => ({
      path: def.path,
      name: def.name,
      meta: def.meta,
      component: () => {
        const loader = views.get(def.view);
        return loader ? loader() : Promise.resolve(unregisteredView(def.view));
      },
    }),
  ),
];

const router = createRouter({
  history: createWebHistory(base),
  routes: records,
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
