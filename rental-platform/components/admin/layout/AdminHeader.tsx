"use client";

import { Menu, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUIStore } from "@/lib/stores/ui.store";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_ROLE_LABELS } from "@/lib/constants/roles";
import { NotificationBell } from "./NotificationBell";

// Map the first path segment to a section title. Read-only: derives a label
// from the current route, it does not change any routing.
const SECTION_TITLES: Record<string, string> = {
  dashboard: "Operations dashboard",
  analytics: "Analytics",
  crm: "Leads pipeline",
  bookings: "Bookings",
  finance: "Finance hub",
  units: "Units",
  owners: "Owners",
  clients: "Clients",
  reviews: "Review moderation",
  notifications: "Notifications",
  areas: "Resort areas",
  amenities: "Amenities",
  settings: "Admin settings",
};

function deriveSectionTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const key = (segments[0] === "admin" ? segments[1] : segments[0]) ?? "dashboard";
  return SECTION_TITLES[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function AdminHeader() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const roleLabel =
    role && role in ADMIN_ROLE_LABELS
      ? ADMIN_ROLE_LABELS[role as keyof typeof ADMIN_ROLE_LABELS]
      : role;

  const sectionTitle = deriveSectionTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-neutral-900">
          {sectionTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-neutral-100 text-neutral-500">
            <UserCircle size={18} />
          </div>
          <div className="hidden flex-col items-start leading-tight lg:flex">
            <span className="text-sm font-medium text-neutral-900">
              {user?.identifier || "Admin user"}
            </span>
            {roleLabel && (
              <span className="text-xs text-neutral-500">{roleLabel}</span>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        <LogoutButton />
      </div>
    </header>
  );
}
