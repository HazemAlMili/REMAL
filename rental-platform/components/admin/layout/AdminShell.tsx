"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authService } from "@/lib/api/services/auth.service";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

/**
 * AdminShell — client component that owns the admin layout chrome.
 *
 * On first render the access token is always null (not persisted for security).
 * We proactively call the refresh endpoint BEFORE mounting any child that may
 * issue API calls, so no child ever sees a 401 on its first request.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Token already present (e.g. navigated client-side after login)
    if (accessToken) {
      setIsReady(true);
      return;
    }

    // No token → try the refresh cookie before mounting any API-calling child
    authService
      .refresh()
      .then((token) => {
        if (token) setAccessToken(token);
      })
      .catch(() => {
        // Refresh failed (expired / not logged in).
        // Leave token null — existing interceptor will redirect to login.
      })
      .finally(() => {
        setIsReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
