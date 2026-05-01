// ═══════════════════════════════════════════════════════════
// app/account/notifications/page.tsx
// Client notification inbox — currently shows empty/placeholder state
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell, CheckCheck } from "lucide-react";

type NotificationFilter = "all" | "unread";

export default function ClientNotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");

  // ⚠️ BACKEND GAP: No client notification endpoints documented.
  // GET /api/internal/me/notifications/inbox requires admin auth.
  // The page structure is built but data integration is BLOCKED.
  //
  // When the backend adds client notification endpoints:
  // 1. Add useClientNotifications() hook call here
  // 2. Pass notifications to NotificationCard components
  // 3. Use P27-corrected field names: subject, readAt, notificationStatus, createdAt

  const notifications: never[] = []; // Empty until backend endpoint is available
  const unreadCount = 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          Notifications
        </h1>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Mark all as read (when endpoint available)
              // markAllReadMutation.mutate(unreadNotificationIds)
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
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

      {/* Notification List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {/* {notifications
            .filter(n => activeFilter === 'all' || n.readAt === null)   // P27: readAt === null
            .map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markReadMutation.mutate(id)}
              />
            ))
          } */}
        </div>
      ) : (
        <EmptyState
          title="No notifications yet"
          description="When you receive booking updates and reminders, they'll appear here."
          icon={<Bell className="h-12 w-12" />}
          action={
            <Button onClick={() => (window.location.href = "/units")}>
              Browse Properties
            </Button>
          }
        />
      )}

      {/* ⚠️ DEVELOPMENT NOTE — Remove when backend endpoints are added */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-800">
            ⚠️ Backend Endpoints Pending
          </p>
          <p className="mt-1 text-amber-700">
            Client notifications require documented endpoints:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700">
            <li>
              <code className="rounded bg-amber-100 px-1">
                GET /api/client/me/notifications/inbox
              </code>
            </li>
            <li>
              <code className="rounded bg-amber-100 px-1">
                GET /api/client/me/notifications/inbox/summary
              </code>
            </li>
            <li>
              <code className="rounded bg-amber-100 px-1">
                POST /api/client/me/notifications/inbox/{"{id}"}/read
              </code>
            </li>
          </ul>
          <p className="mt-2 text-amber-700">
            P27 field names:{" "}
            <code className="rounded bg-amber-100 px-1">subject</code> (not
            title), <code className="rounded bg-amber-100 px-1">readAt</code>{" "}
            (not isRead),{" "}
            <code className="rounded bg-amber-100 px-1">
              notificationStatus
            </code>
            , <code className="rounded bg-amber-100 px-1">createdAt</code>.
          </p>
        </div>
      )}
    </div>
  );
}
