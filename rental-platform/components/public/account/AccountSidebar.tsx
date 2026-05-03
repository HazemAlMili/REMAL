// ═══════════════════════════════════════════════════════════
// components/public/account/AccountSidebar.tsx
// Minimal sidebar for client account — 4 nav items
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLogout } from "@/lib/hooks/useLogout";
import { Button } from "@/components/ui/Button";
import { CalendarCheck, Star, Bell, LogOut, Home } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout, isLoading: isLoggingOut } = useLogout();

  return (
    <aside className="min-h-[calc(100vh-80px)] w-64 shrink-0 border-r border-neutral-100 bg-white">
      <div className="p-6">
        {/* Client Info */}
        <div className="mb-8">
          <p className="font-display text-lg font-semibold text-neutral-900">
            My Account
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {user?.identifier || "Client"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary-500/10 text-primary-500"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t border-neutral-100" />

        {/* Browse Properties Link */}
        <Link
          href="/units"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          <Home className="h-5 w-5" />
          Browse Properties
        </Link>

        {/* Logout */}
        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-600 hover:text-red-600"
            onClick={logout}
            isLoading={isLoggingOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
