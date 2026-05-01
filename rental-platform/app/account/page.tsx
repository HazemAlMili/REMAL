// ═══════════════════════════════════════════════════════════
// app/account/page.tsx
// Client dashboard — welcome + placeholder cards
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { CalendarCheck, Bell, ArrowRight, Home } from "lucide-react";

export default function AccountDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-neutral-600">{user?.identifier || "Client"}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/units">
          <Button variant="primary" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Browse Properties
          </Button>
        </Link>
        <Link href="/account/bookings">
          <Button variant="secondary" size="sm">
            <CalendarCheck className="mr-2 h-4 w-4" />
            My Bookings
          </Button>
        </Link>
      </div>

      {/* Recent Bookings Card — BLOCKED by backend gap */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Recent Bookings
          </h2>
          <Link
            href="/account/bookings"
            className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ⚠️ BACKEND GAP: No client-scoped bookings endpoint documented.
            GET /api/internal/bookings requires admin auth.
            Show placeholder until backend provides GET /api/client/bookings. */}
        <div className="py-8 text-center">
          <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-500">
            Your booking history will appear here
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Bookings you submit will show up in this section
          </p>
        </div>
      </div>

      {/* Notifications Card — BLOCKED by backend gap */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Notifications
          </h2>
          <Link
            href="/account/notifications"
            className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ⚠️ BACKEND GAP: No /api/client/me/notifications/inbox endpoint documented.
            Show placeholder until backend provides client notification endpoint. */}
        <div className="py-8 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-500">No new notifications</p>
          <p className="mt-1 text-xs text-neutral-400">
            Booking updates and reminders will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
