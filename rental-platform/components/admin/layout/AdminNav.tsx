import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Home,
  Building2,
  UserCheck,
  Star,
  Shield,
  MapPin,
  Coffee,
  BarChart3,
  Bell,
  LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { usePermissions, Permissions } from "@/lib/hooks/usePermissions";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  requiredPermission?: keyof Permissions;
}

export interface AdminNavProps {
  isCollapsed: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: ROUTES.admin.dashboard,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: ROUTES.admin.analytics,
    requiredPermission: "canViewReports",
  },
  {
    label: "CRM",
    icon: Users,
    href: ROUTES.admin.crm.index,
    requiredPermission: "canViewCRM",
  },
  {
    label: "Bookings",
    icon: Calendar,
    href: ROUTES.admin.bookings.list,
    requiredPermission: "canViewBookings",
  },
  {
    label: "Finance",
    icon: Wallet,
    href: ROUTES.admin.finance,
    requiredPermission: "canViewFinance",
  },
  {
    label: "Units",
    icon: Home,
    href: ROUTES.admin.units.list,
    requiredPermission: "canViewUnits",
  },
  {
    label: "Owners",
    icon: Building2,
    href: ROUTES.admin.owners.list,
    requiredPermission: "canViewOwners",
  },
  {
    label: "Clients",
    icon: UserCheck,
    href: ROUTES.admin.clients.list,
    requiredPermission: "canViewClients",
  },
  {
    label: "Reviews",
    icon: Star,
    href: ROUTES.admin.reviews,
    requiredPermission: "canModerateReviews",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: ROUTES.admin.notifications,
  },
  {
    label: "Areas",
    icon: MapPin,
    href: "/admin/areas",
    requiredPermission: "canManageAreas",
  },
  {
    label: "Amenities",
    icon: Coffee,
    href: "/admin/amenities",
    requiredPermission: "canManageAmenities",
  },
  {
    label: "Admin Users",
    icon: Shield,
    href: ROUTES.admin.settings,
    requiredPermission: "canManageAdminUsers",
  },
];

export function AdminNav({ isCollapsed }: AdminNavProps) {
  const pathname = usePathname();
  const permissions = usePermissions();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV_ITEMS.map((item) => {
        // If there's a required permission and the user doesn't have it, hiding
        if (item.requiredPermission && !permissions[item.requiredPermission]) {
          return null;
        }

        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={isCollapsed ? item.label : undefined}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-50 text-primary-600"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon
              size={20}
              className={cn(
                "flex-shrink-0",
                isActive ? "text-primary-600" : "text-neutral-500"
              )}
            />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
