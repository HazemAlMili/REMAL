// ═══════════════════════════════════════════════════════════
// lib/hooks/useClientAuth.ts
// Client authentication hooks — auth guard and logout
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";

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
      router.replace("/client/login");
      return;
    }

    if (subjectType === "Admin") {
      // Logged in as admin → redirect to admin dashboard
      router.replace("/dashboard");
      return;
    }

    if (subjectType === "Owner") {
      // Logged in as owner → redirect to owner dashboard
      router.replace("/owner/dashboard");
      return;
    }

    // subjectType === 'Client' → allow access
  }, [subjectType, router]);

  const isClient = subjectType === "Client";

  return { isClient, user };
}

/**
 * Client logout hook
 * Calls POST /api/auth/logout FIRST, then clears store
 */
export function useClientLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Step 1: Call API logout FIRST — needs current access token
      // This invalidates the HttpOnly refresh cookie on the server
      await api.post(endpoints.auth.logout);
    } catch {
      // Even if API logout fails, proceed with local cleanup
      // The refresh token will eventually expire on its own
    } finally {
      // Step 2: THEN clear auth store (removes access token from memory)
      clearAuth();

      // Step 3: Redirect to client login page
      router.replace("/client/login");
      setIsLoggingOut(false);
    }
  };

  return { handleLogout, isLoggingOut };
}
