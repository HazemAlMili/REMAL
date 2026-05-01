"use client";

import { useState } from "react";
import {
  useOwnerNotificationInbox,
  useMarkAllOwnerNotificationsRead,
} from "@/lib/hooks/useNotifications";
import { OwnerNotificationItem } from "@/components/owner/notifications/OwnerNotificationItem";
import { OwnerNotificationPreferences } from "@/components/owner/notifications/OwnerNotificationPreferences";
import { Button } from "@/components/ui/Button";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";

export default function OwnerNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "preferences">("inbox");

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useOwnerNotificationInbox();
  const markAllReadMutation = useMarkAllOwnerNotificationsRead();

  // Per P27: readAt === null means unread
  const hasUnread = notifications?.some((n) => n.readAt === null);

  return (
    <div className="space-y-0">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-neutral-900">
            Notifications
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("inbox")}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "inbox"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "preferences"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              Preferences
            </button>
          </div>
        </div>
        {activeTab === "inbox" && hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "inbox" ? (
        <InboxContent
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
        />
      ) : (
        <OwnerNotificationPreferences />
      )}
    </div>
  );
}

// Inbox content component
function InboxContent({
  notifications,
  isLoading,
  error,
  refetch,
}: {
  notifications: NotificationListItemResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-lg bg-neutral-200"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load notifications
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load your notifications.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">
            No notifications yet
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            When you receive bookings or payouts, notifications will appear
            here.
          </p>
        </div>
      </div>
    );
  }

  // Notification list
  return (
    <div>
      {notifications.map((notification) => (
        <OwnerNotificationItem
          key={notification.notificationId}
          notification={notification}
        />
      ))}
    </div>
  );
}
