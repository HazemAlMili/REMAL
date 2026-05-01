// ═══════════════════════════════════════════════════════════
// app/account/layout.tsx
// Client account layout — sidebar + content area + auth guard
// ═══════════════════════════════════════════════════════════

"use client";
import { useClientGuard } from "@/lib/hooks/useClientAuth";
import { AccountSidebar } from "@/components/public/account/AccountSidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Star, Bell, Home } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: Home },
  { href: "/account/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
];

function MobileAccountNav() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto border-b border-neutral-100 bg-white">
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
              className={`
                flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary-500/10 text-primary-500"
                    : "text-neutral-600 hover:bg-neutral-50"
                }
              `}
            >
              <Icon className="h-4 w-4" />
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

  // While redirecting, show skeleton
  if (!isClient) {
    return (
      <div className="mx-auto max-w-container px-6 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="flex gap-8">
          <Skeleton className="h-96 w-64 rounded-xl" />
          <Skeleton className="h-96 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
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
