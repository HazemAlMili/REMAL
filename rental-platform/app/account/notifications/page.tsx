"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useClientNotificationInbox,
  useClientNotificationSummary,
  useMarkAllClientNotificationsRead,
  useMarkClientNotificationRead,
} from "@/lib/hooks/useNotifications";
import { formatDate } from "@/lib/utils/format";
import { Bell, Check, CheckCheck } from "lucide-react";

type NotificationFilter = "all" | "unread";

export default function ClientNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const unreadOnly = activeFilter === "unread";
  const { data: summary } = useClientNotificationSummary();
  const { data: notifications = [], isLoading, isError } = useClientNotificationInbox({
    unreadOnly,
    page: 1,
    pageSize: 50,
  });
  const markReadMutation = useMarkClientNotificationRead();
  const markAllReadMutation = useMarkAllClientNotificationsRead();
  const unreadCount = summary?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {unreadCount} unread of {summary?.totalCount ?? 0} total
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveFilter("all")}
          className={`border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter("unread")}
          className={`border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
            activeFilter === "unread"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Notifications could not load"
          description="Refresh the page or try again after a moment."
          icon={<Bell className="h-12 w-12" />}
        />
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          description="Booking updates and reminders will appear here."
          icon={<Bell className="h-12 w-12" />}
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isUnread = !notification.readAt;

            return (
              <article
                key={notification.notificationId}
                className="rounded-xl border border-neutral-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                      <h2 className="text-sm font-semibold text-neutral-900">
                        {notification.subject ?? "Notification"}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {notification.body}
                    </p>
                    <p className="mt-3 text-xs text-neutral-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(notification.notificationId)}
                      isLoading={markReadMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark read
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}