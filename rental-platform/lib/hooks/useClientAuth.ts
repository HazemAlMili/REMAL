// ═══════════════════════════════════════════════════════════
// lib/hooks/useClientAuth.ts
// Client authentication hooks — auth guard only
// useClientLogout removed — use canonical useLogout instead
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { ROUTES } from "@/lib/constants/routes";
import { authService } from "@/lib/api/services/auth.service";

/**
 * Auth guard for client account pages
 * Redirects non-client users to appropriate login/dashboard
 */
export function useClientGuard() {
  const { accessToken, subjectType, user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (subjectType === "Admin") {
        router.replace(ROUTES.admin.dashboard);
        if (isMounted) setIsCheckingSession(false);
        return;
      }

      if (subjectType === "Owner") {
        router.replace(ROUTES.owner.dashboard);
        if (isMounted) setIsCheckingSession(false);
        return;
      }

      if (subjectType === "Client" && accessToken) {
        if (isMounted) setIsCheckingSession(false);
        return;
      }

      try {
        const refreshedAuth = await authService.refresh();

        if (!refreshedAuth) {
          clearAuth();
          router.replace(ROUTES.auth.clientLogin);
          return;
        }

        setAuth({
          accessToken: refreshedAuth.accessToken,
          expiresInSeconds: refreshedAuth.expiresInSeconds,
          subjectType: refreshedAuth.subjectType,
          user: refreshedAuth.user,
          role:
            refreshedAuth.subjectType === "Admin"
              ? refreshedAuth.adminRole
              : refreshedAuth.subjectType,
        });

        if (refreshedAuth.subjectType === "Admin") {
          router.replace(ROUTES.admin.dashboard);
          return;
        }

        if (refreshedAuth.subjectType === "Owner") {
          router.replace(ROUTES.owner.dashboard);
          return;
        }

        if (refreshedAuth.subjectType !== "Client") {
          router.replace(ROUTES.auth.clientLogin);
          return;
        }
      } catch {
        clearAuth();
        router.replace(ROUTES.auth.clientLogin);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearAuth, router, setAuth, subjectType]);

  const isClient = subjectType === "Client" && !isCheckingSession;

  return { isClient, isCheckingSession, user };
}
