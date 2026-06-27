"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { tokenStore } from "./token-store";
import { bootstrapSession, logoutSession } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";

interface AuthContextValue {
  isAuthenticated: boolean;
  /** True once the initial refresh attempt has completed (success or failure). */
  isReady: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Bootstraps the storefront session from the HttpOnly refresh cookie on mount
 * (so a login handed off to the platform "sticks" here, and survives a hard
 * reload), and keeps React in sync with the module-level token store.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenStore.getAccessToken()
  );
  const [user, setUser] = useState<AuthUser | null>(tokenStore.getUser());
  const [isReady, setIsReady] = useState<boolean>(tokenStore.isBootstrapped());

  useEffect(() => {
    const sync = () => {
      setAccessToken(tokenStore.getAccessToken());
      setUser(tokenStore.getUser());
      setIsReady(tokenStore.isBootstrapped());
    };
    const unsubscribe = tokenStore.subscribe(sync);

    if (!tokenStore.isBootstrapped()) {
      void bootstrapSession();
    } else {
      sync();
    }

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: Boolean(accessToken),
    isReady,
    user,
    accessToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
