// ═══════════════════════════════════════════════════════════
// lib/hooks/useClientAuth.ts
// Client authentication hooks — auth guard only
// useClientLogout removed — use canonical useLogout instead
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Auth guard for client account pages
 * Redirects non-client users to appropriate login/dashboard
 */
export function useClientGuard() {
  const { subjectType, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!subjectType) {
      // Not logged in → redirect to client login
      router.replace(ROUTES.auth.clientLogin);
      return;
    }

    if (subjectType === "Admin") {
      // Logged in as admin → redirect to admin dashboard
      router.replace(ROUTES.admin.dashboard);
      return;
    }

    if (subjectType === "Owner") {
      // Logged in as owner → redirect to owner dashboard
      router.replace(ROUTES.owner.dashboard);
      return;
    }

    // subjectType === 'Client' → allow access
  }, [subjectType, router]);

  const isClient = subjectType === "Client";

  return { isClient, user };
}
