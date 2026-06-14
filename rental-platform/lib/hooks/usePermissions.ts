import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { AdminRole } from "@/lib/types/auth.types";

export interface Permissions {
  isAdmin: boolean;
  isOwner: boolean;
  isClient: boolean;

  canViewCRM: boolean;
  canManageCRM: boolean;
  canAssignLeads: boolean;
  canViewBookings: boolean;
  canViewFinance: boolean;
  canManageFinance: boolean;
  canManageBookings: boolean;
  canViewUnits: boolean;
  canViewOwners: boolean;
  canManageOwners: boolean;
  canViewClients: boolean;
  canManageClients: boolean;
  canModerateReviews: boolean;
  canManageAdminUsers: boolean;
  canManageAreas: boolean;
  canManageAmenities: boolean;
  canManageUnits: boolean;
  canViewReports: boolean;
}

/**
 * Transitional fallback only: mirrors the backend PermissionCatalog
 * (RentalPlatform.API/Authorization/PermissionCatalog.cs) for sessions that
 * were persisted before the server started returning `permissions`. The
 * server-issued list always wins; this disappears on the next login/refresh.
 */
const LEGACY_ROLE_POLICIES: Record<AdminRole, string[]> = {
  SuperAdmin: [
    "AdminAuthenticated",
    "SuperAdminOnly",
    "SalesOrSuperAdmin",
    "FinanceOrSuperAdmin",
    "InternalAdminReadOwners",
    "InternalAdminRead",
    "InternalUnitsRead",
    "InternalAnalyticsRead",
  ],
  Sales: [
    "AdminAuthenticated",
    "SalesOrSuperAdmin",
    "InternalAdminReadOwners",
    "InternalAdminRead",
    "InternalUnitsRead",
    "InternalAnalyticsRead",
  ],
  // Finance owns money, not inventory: no InternalUnitsRead (keeps analytics).
  Finance: [
    "AdminAuthenticated",
    "FinanceOrSuperAdmin",
    "InternalAdminReadOwners",
    "InternalAdminRead",
    "InternalAnalyticsRead",
  ],
  Tech: ["AdminAuthenticated", "InternalUnitsRead", "InternalAnalyticsRead"],
};

export function usePermissions(): Permissions {
  const subjectType = useAuthStore((s) => s.subjectType);
  const role = useAuthStore((s) => s.role);
  const serverPermissions = useAuthStore((s) => s.permissions);

  return useMemo(() => {
    const isAdmin = subjectType === "Admin";
    const isOwner = subjectType === "Owner";
    const isClient = subjectType === "Client";

    const grants: string[] =
      serverPermissions.length > 0
        ? serverPermissions
        : isAdmin && role && role !== "Owner" && role !== "Client"
          ? LEGACY_ROLE_POLICIES[role] ?? []
          : [];

    // Each UI capability maps to the backend policy that guards its endpoints,
    // so what the UI shows and what the API allows cannot drift.
    const has = (policy: string) => isAdmin && grants.includes(policy);

    return {
      isAdmin,
      isOwner,
      isClient,

      canViewCRM: has("SalesOrSuperAdmin"),
      canManageCRM: has("SalesOrSuperAdmin"),
      canAssignLeads: has("SalesOrSuperAdmin"),
      canViewBookings: has("InternalAdminRead"),
      canViewFinance: has("FinanceOrSuperAdmin"),
      canManageFinance: has("FinanceOrSuperAdmin"),
      canManageBookings: has("SalesOrSuperAdmin"),
      canViewUnits: has("InternalUnitsRead"),
      canViewOwners: has("InternalAdminReadOwners"),
      canManageOwners: has("SuperAdminOnly"),
      canViewClients: has("InternalAdminRead"),
      canManageClients: has("SalesOrSuperAdmin"),
      canModerateReviews: has("SalesOrSuperAdmin"),
      canManageAdminUsers: has("SuperAdminOnly"),
      canManageAreas: has("SuperAdminOnly"),
      canManageAmenities: has("SuperAdminOnly"),
      canManageUnits: has("SuperAdminOnly"),
      canViewReports: has("InternalAnalyticsRead"),
    };
  }, [subjectType, role, serverPermissions]);
}
