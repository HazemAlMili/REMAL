// ═══════════════════════════════════════════════════════════
// app/account/page.tsx
// Client dashboard
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useClientBookings, useClientProfile } from "@/lib/hooks/useClient";
import {
  useClientNotificationInbox,
  useClientNotificationSummary,
} from "@/lib/hooks/useNotifications";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { CalendarCheck, Bell, ArrowRight, Home } from "lucide-react";

export default function AccountDashboardPage() {
  const { user } = useAuthStore();
  const { data: profile } = useClientProfile();
  const { data: bookingsData, isLoading: bookingsLoading } = useClientBookings({
    page: 1,
    pageSize: 5,
  });
  const { data: notificationSummary } = useClientNotificationSummary();
  const { data: notifications = [], isLoading: notificationsLoading } =
    useClientNotificationInbox({ page: 1, pageSize: 3 });

  const bookings = bookingsData?.items ?? [];
  const displayName = profile?.name ?? user?.identifier ?? "Client";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-neutral-600">{displayName}</p>
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

        {bookingsLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        )}

        {!bookingsLoading && bookings.length === 0 && (
          <EmptyState
            title="No bookings yet"
            description="Submitted booking requests will appear here."
            icon={<CalendarCheck className="h-12 w-12" />}
            className="min-h-[190px]"
          />
        )}

        {!bookingsLoading && bookings.length > 0 && (
          <div className="divide-y divide-neutral-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {booking.unitName ?? "Property"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-sm font-semibold text-neutral-900 sm:inline">
                    {formatCurrency(booking.finalAmount)}
                  </span>
                  <StatusBadge status={booking.bookingStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

        <div className="mb-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {notificationSummary?.unreadCount ?? 0} unread of {notificationSummary?.totalCount ?? 0} total
        </div>

        {notificationsLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        )}

        {!notificationsLoading && notifications.length === 0 && (
          <EmptyState
            title="No notifications yet"
            description="Booking updates and reminders will appear here."
            icon={<Bell className="h-12 w-12" />}
            className="min-h-[190px]"
          />
        )}

        {!notificationsLoading && notifications.length > 0 && (
          <div className="divide-y divide-neutral-100">
            {notifications.map((notification) => (
              <div key={notification.notificationId} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">
                    {notification.subject ?? "Notification"}
                  </p>
                  {!notification.readAt && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                  {notification.body}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
