"use client";

import { formatDistanceToNow } from "date-fns";
import { useMarkOwnerNotificationRead } from "@/lib/hooks/useNotifications";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";

const CHANNEL_LABELS: Record<string, string> = {
  Email: "Email",
  SMS: "SMS",
  InApp: "In-app",
};

interface OwnerNotificationItemProps {
  notification: NotificationListItemResponse;
}

export function OwnerNotificationItem({
  notification,
}: OwnerNotificationItemProps) {
  const markReadMutation = useMarkOwnerNotificationRead();

  // Per P27: readAt === null means unread
  const isUnread = notification.readAt === null;

  const handleClick = () => {
    if (isUnread) {
      markReadMutation.mutate(notification.notificationId);
    }
    // Future enhancement: navigate to deep link if available
  };

  return (
    <div
      onClick={handleClick}
      className={[
        "flex cursor-pointer items-start gap-4 border-b border-neutral-100 p-4 transition-colors hover:bg-neutral-50",
        isUnread && "bg-blue-50/40",
      ].join(" ")}
    >
      {/* Unread indicator dot */}
      <div className="mt-1.5 flex-shrink-0">
        {isUnread && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm",
            isUnread
              ? "font-semibold text-neutral-900"
              : "font-medium text-neutral-600",
          ].join(" ")}
        >
          {notification.subject}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={[
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              "bg-neutral-100 text-neutral-600",
            ].join(" ")}
          >
            {CHANNEL_LABELS[notification.channel] || notification.channel}
          </span>
          <span className="text-xs text-neutral-400">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
