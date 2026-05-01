"use client";

import { Menu, UserCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUIStore } from "@/lib/stores/ui.store";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_ROLE_LABELS } from "@/lib/constants/roles";
import { NotificationBell } from "./NotificationBell";

export function AdminHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const roleLabel =
    role && role in ADMIN_ROLE_LABELS
      ? ADMIN_ROLE_LABELS[role as keyof typeof ADMIN_ROLE_LABELS]
      : role;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <Menu size={24} />
        </button>
        <span className="hidden font-display text-xl font-semibold text-neutral-900 md:block">
          Remal Admin
        </span>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <UserCircle size={20} />
          </div>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium leading-tight text-neutral-900">
              {user?.identifier || "Admin User"}
            </span>
            {roleLabel && (
              <span className="text-xs font-medium tracking-wide text-neutral-500">
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        <LogoutButton />
      </div>
    </header>
  );
}
