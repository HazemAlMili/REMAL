// ═══════════════════════════════════════════════════════════
// components/public/account/AccountSidebar.tsx
// Sidebar for the client account portal — brand lockup, nav,
// and a bottom-anchored footer (Browse + Log out).
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLogout } from "@/lib/hooks/useLogout";
import { useClientNotificationSummary } from "@/lib/hooks/useNotifications";
import {
  CalendarCheck,
  Star,
  Bell,
  LogOut,
  Home,
  LayoutDashboard,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const { data: notificationSummary } = useClientNotificationSummary();
  const unreadCount = notificationSummary?.unreadCount ?? 0;

  return (
    <aside className="flex min-h-[calc(100vh-80px)] w-64 shrink-0 flex-col rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-1 flex-col p-6">
        {/* Client Info */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            R
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-neutral-900">
              My Account
            </p>
            <p className="truncate text-xs text-neutral-500">
              {user?.identifier || "Client"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors
                  ${
                    isActive
                      ? "bg-neutral-100 font-semibold text-neutral-900"
                      : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }
                `}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary-500"
                  />
                )}
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-primary-500" : "text-neutral-400"}`}
                />
                <span className="flex-1">{item.label}</span>
                {item.href === "/account/notifications" && unreadCount > 0 && (
                  <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium tabular-nums text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — pinned to the bottom of the rail */}
        <div className="mt-auto">
          <div className="mb-3 border-t border-neutral-200" />

          <Link
            href="/units"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Home className="h-5 w-5 text-neutral-400" />
            Browse Properties
          </Link>

          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
