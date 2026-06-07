// ═══════════════════════════════════════════════════════════
// app/account/layout.tsx
// Client account layout — sidebar + content area + auth guard
// ═══════════════════════════════════════════════════════════

"use client";
import { useClientGuard } from "@/lib/hooks/useClientAuth";
import { AccountSidebar } from "@/components/public/account/AccountSidebar";
import { PortalSplash, usePortalReady } from "@/components/ui/PortalSplash";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Star, Bell, Home, User } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: Home },
  { href: "/account/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile", icon: User },
];

function MobileAccountNav() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <div className="flex gap-1 p-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm transition-colors
                ${
                  isActive
                    ? "bg-neutral-100 font-semibold text-neutral-900"
                    : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }
              `}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-primary-500" : "text-neutral-400"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isClient } = useClientGuard();
  // Keep the branded handoff visible briefly so it's seen after sign-in.
  const showApp = usePortalReady(isClient);

  // Authenticating / bootstrapping the account — branded loading handoff.
  if (!showApp) {
    return <PortalSplash className="portal-client" label="Loading your account" />;
  }

  return (
    <div className="portal-client content-density-spacious min-h-screen bg-neutral-50 text-neutral-700">
      <div className="mx-auto max-w-container px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar — hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>

          {/* Content area */}
          <div className="flex-1">
            {/* Mobile navigation */}
            <div className="mb-6 lg:hidden">
              <MobileAccountNav />
            </div>

            {/* Page content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
