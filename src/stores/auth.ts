// Ported from rebuild/ Gen-1; to be reworked against replica specs.
import { ref, computed } from "vue";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  role: string;
}

const token = ref<string | null>(localStorage.getItem("swarmy_ui-token"));
const user = ref<User | null>(null);
const checked = ref(false);
const loading = ref(false);

export function useAuthStore() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("swarmy_ui-token", newToken);
    } else {
      localStorage.removeItem("swarmy_ui-token");
    }
  }

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setToken(data.token);
      user.value = data.user;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Login failed" };
    } finally {
      loading.value = false;
    }
  }

  async function checkSession() {
    if (!token.value) {
      checked.value = true;
      return false;
    }
    try {
      const res = await api("/auth/me");
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      user.value = data.user || null;
      checked.value = true;
      return true;
    } catch {
      setToken(null);
      user.value = null;
      checked.value = true;
      return false;
    }
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setToken(null);
    user.value = null;
  }

  return {
    token,
    user,
    checked,
    loading,
    isAuthenticated,
    login,
    checkSession,
    logout,
    setToken,
  };
}
