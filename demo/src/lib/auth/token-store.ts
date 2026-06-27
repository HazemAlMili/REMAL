import type { AuthUser } from "@/lib/api/types";

/**
 * Module-level session holder for the storefront.
 *
 * The access token lives in memory only (never localStorage); the durable
 * carrier is the HttpOnly `refresh_token` cookie set by the API. The fetch
 * client reads the token here on every request, and AuthProvider subscribes to
 * mirror it into React state. This is the same shape as the platform's Zustand
 * `getState()` — a singleton the non-React axios/fetch layer can read.
 */
type Listener = () => void;

let accessToken: string | null = null;
let user: AuthUser | null = null;
let bootstrapped = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,
  getUser: (): AuthUser | null => user,
  /** True once a refresh attempt (success or failure) has completed. */
  isBootstrapped: (): boolean => bootstrapped,

  setSession(nextToken: string | null, nextUser: AuthUser | null): void {
    accessToken = nextToken;
    user = nextUser;
    bootstrapped = true;
    emit();
  },

  setAccessToken(nextToken: string | null): void {
    accessToken = nextToken;
    emit();
  },

  clear(): void {
    accessToken = null;
    user = null;
    bootstrapped = true;
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
