import { useAuthStore } from "@/lib/stores/auth.store";

export interface Permissions {
  isAdmin: boolean;
  isOwner: boolean;
  isClient: boolean;

  canViewCRM: boolean;
  canManageCRM: boolean;
  canAssignLeads: boolean;
  canViewBookings: boolean;
  canViewFinance: boolean;
  canViewUnits: boolean;
  canViewOwners: boolean;
  canViewClients: boolean;
  canModerateReviews: boolean;
  canManageAdminUsers: boolean;
  canManageAreas: boolean;
  canManageAmenities: boolean;
  canManageUnits: boolean;
}

export function usePermissions(): Permissions {
  const subjectType = useAuthStore((s) => s.subjectType);
  const role = useAuthStore((s) => s.role);

  const isAdmin = subjectType === "Admin";
  const isOwner = subjectType === "Owner";
  const isClient = subjectType === "Client";

  // Admin sub-roles
  const isSuperAdmin = isAdmin && role === "SuperAdmin";
  const isSales = isAdmin && role === "Sales";
  const isFinance = isAdmin && role === "Finance";
  const isTech = isAdmin && role === "Tech";

  return {
    isAdmin,
    isOwner,
    isClient,

    canViewCRM: isSuperAdmin || isSales,
    canManageCRM: isSuperAdmin || isSales,
    canAssignLeads: isSuperAdmin,
    canViewBookings: isSuperAdmin || isSales || isFinance,
    canViewFinance: isSuperAdmin || isFinance,
    canViewUnits: isSuperAdmin || isSales || isFinance || isTech,
    canViewOwners: isSuperAdmin || isFinance || isSales,
    canViewClients: isSuperAdmin || isSales,
    canModerateReviews: isSuperAdmin || isSales,
    canManageAdminUsers: isSuperAdmin || isTech,
    canManageAreas: isSuperAdmin,
    canManageAmenities: isSuperAdmin,
    canManageUnits: isSuperAdmin || isTech,
  };
}
