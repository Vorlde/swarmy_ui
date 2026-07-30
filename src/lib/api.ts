// The single networking seam. Nothing above this file may call `fetch` directly.
//
// Two exports, deliberately:
//   - `platformApi()`  the generated typed client (`PlatformApi`), for every
//     endpoint that the contract covers. This is what stores should use.
//   - `api()`          a thin `fetch` wrapper on the same base URL and auth
//     header, kept for the handful of calls that predate the typed client
//     (auth login/me/logout) and for streaming/upload paths the generator does
//     not model.
//
// Both funnel 401 through one `onUnauthorized` handler so the router can own
// the session-expiry redirect (ADR-006: only stores and this module talk to
// the network).
import { PlatformApi } from "@api/index";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const TOKEN_KEY = "swarmy_ui-token";

let unauthorizedHandler: (() => void) | null = null;

/** Registered once by the router; invoked on any 401 from either transport. */
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

function currentToken(): string | undefined {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

export async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = currentToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}/api${path}`, { ...init, headers });
  if (res.status === 401) unauthorizedHandler?.();
  return res;
}

let cached: { token: string | undefined; client: PlatformApi } | null = null;

/** Typed client bound to the current session token. Re-created when it changes. */
export function platformApi(): PlatformApi {
  const token = currentToken();
  if (!cached || cached.token !== token) {
    cached = {
      token,
      client: new PlatformApi({
        baseUrl: BASE_URL || window.location.origin,
        token,
        onUnauthorized: () => unauthorizedHandler?.(),
      }),
    };
  }
  return cached.client;
}
