"use client";

import { useState } from "react";
import {
  useAdminNotificationInbox,
  useMarkAdminNotificationRead,
} from "@/lib/hooks/useNotifications";
import { NotificationItem } from "@/components/admin/notifications/NotificationItem";
import { DispatchNotificationModal } from "@/components/admin/notifications/DispatchNotificationModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toast } from "react-hot-toast";

export default function AdminNotificationsPage() {
  const { data: notifications, isLoading, error } = useAdminNotificationInbox();
  const markReadMutation = useMarkAdminNotificationRead();
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingItemId, setMarkingItemId] = useState<string | null>(null);
  const [dispatchModal, setDispatchModal] = useState(false);
  const { canManageAdminUsers } = usePermissions();

  // Per P27: readAt === null means unread
  const unreadNotifications =
    notifications?.filter((n) => n.readAt === null) ?? [];
  const hasUnread = unreadNotifications.length > 0;

  const handleMarkRead = (notificationId: string) => {
    setMarkingItemId(notificationId);
    markReadMutation.mutate(notificationId, {
      onSettled: () => setMarkingItemId(null),
    });
  };

  const handleMarkAllRead = async () => {
    if (!hasUnread || markingAllRead) return;

    setMarkingAllRead(true);
    let failedCount = 0;

    for (const notification of unreadNotifications) {
      try {
        await markReadMutation.mutateAsync(notification.notificationId);
      } catch {
        failedCount++;
      }
    }

    setMarkingAllRead(false);

    if (failedCount === 0) {
      toast.success(
        `Marked ${unreadNotifications.length} notification${unreadNotifications.length > 1 ? "s" : ""} as read`
      );
    } else {
      toast.error(`Failed to mark ${failedCount} notification(s) as read`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {hasUnread
              ? `${unreadNotifications.length} unread notification${unreadNotifications.length > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canManageAdminUsers && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDispatchModal(true)}
            >
              Send Notification
            </Button>
          )}
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              isLoading={markingAllRead}
              disabled={markingAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={72} className="rounded-lg" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <EmptyState
          title="Could not load notifications"
          description="There was a problem fetching your notifications."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Empty state */}
      {!isLoading && !error && notifications?.length === 0 && (
        <EmptyState
          title="No notifications yet"
          description="When you receive notifications, they'll appear here."
        />
      )}

      {/* Notification list */}
      {!isLoading && !error && notifications && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              notification={notification}
              onMarkRead={handleMarkRead}
              isMarkingRead={markingItemId === notification.notificationId}
            />
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
      <DispatchNotificationModal
        isOpen={dispatchModal}
        onClose={() => setDispatchModal(false)}
      />
    </div>
  );
}
