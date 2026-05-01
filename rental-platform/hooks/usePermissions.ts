import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";

export interface Permissions {
  isAdmin: boolean;
  isOwner: boolean;
  isClient: boolean;

  // CRM / client visibility
  canViewCRM: boolean;
  canViewClients: boolean;

  // Finance
  canViewFinance: boolean;
  canManageFinance: boolean;

  // Owner / unit management
  canManageOwners: boolean;
  canManageUnits: boolean;
  canEditUnits: boolean;

  // Bookings
  canManageBookings: boolean;
}

export function usePermissions(): Permissions {
  const subjectType = useAuthStore((s) => s.subjectType);
  const role = useAuthStore((s) => s.role);

  return useMemo(() => {
    const isAdmin = subjectType === "Admin";
    const isOwner = subjectType === "Owner";
    const isClient = subjectType === "Client";

    // Admin sub-roles (only meaningful when subjectType === 'Admin')
    const isSuperAdmin = isAdmin && role === "SuperAdmin";
    const isSales = isAdmin && role === "Sales";
    const isFinance = isAdmin && role === "Finance";
    const isTech = isAdmin && role === "Tech";

    return {
      isAdmin,
      isOwner,
      isClient,

      // SuperAdmin & Sales can see CRM
      canViewCRM: isSuperAdmin || isSales,

      // SuperAdmin & Sales can see clients
      canViewClients: isSuperAdmin || isSales,

      // SuperAdmin & Finance can see finance
      canViewFinance: isSuperAdmin || isFinance,

      // SuperAdmin & Finance can manage finance (create/edit payouts)
      canManageFinance: isSuperAdmin || isFinance,

      // Only SuperAdmin can manage owners
      canManageOwners: isSuperAdmin,

      // SuperAdmin & Tech can manage / edit units
      canManageUnits: isSuperAdmin || isTech,
      canEditUnits: isSuperAdmin || isTech,

      // Admins (any role) and owners can manage bookings
      canManageBookings: isAdmin || isOwner,
    };
  }, [subjectType, role]);
}
