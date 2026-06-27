"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNEL_BADGE,
} from "@/lib/constants/notification-channels";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";
import { NotificationBodyRenderer } from "@/lib/utils/notification-body";
import { cn } from "@/lib/utils/cn";

interface NotificationItemProps {
  notification: NotificationListItemResponse;
  onMarkRead: (notificationId: string) => void;
  onSelect: (notification: NotificationListItemResponse) => void;
  isMarkingRead: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onSelect,
  isMarkingRead,
}: NotificationItemProps) {
  // Per P27: readAt === null means unread
  const isUnread = notification.readAt === null;

  const handleClick = () => {
    onSelect(notification);
    if (isUnread) {
      onMarkRead(notification.notificationId);
    }
  };

  return (
    <button
      id={`notification-item-${notification.notificationId}`}
      type="button"
      onClick={handleClick}
      disabled={isMarkingRead}
      aria-label={`${isUnread ? "Unread notification" : "Notification"}: ${notification.subject}`}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-[var(--portal-radius-control)] border border-neutral-200 bg-white p-4 text-start transition-colors",
        "hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        isMarkingRead ? "cursor-wait opacity-70" : "cursor-pointer"
      )}
    >
      {/* Unread spotlight: a terracotta bar on the inline-start edge */}
      {isUnread && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-1 bg-primary-500"
        />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className={cn(
            "text-sm text-neutral-900",
            isUnread ? "font-semibold" : "font-medium"
          )}
        >
          {notification.subject}
        </p>
        <NotificationBodyRenderer
          body={notification.body}
          structured={false}
          className="mt-1 line-clamp-2 text-xs text-neutral-500"
        />
        <p className="mt-1.5 text-[11px] text-neutral-400">
          From {notification.senderLabel}
        </p>
      </div>

      {/* Meta */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant={NOTIFICATION_CHANNEL_BADGE[notification.channel]} size="sm">
          {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
        </Badge>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {format(new Date(notification.createdAt), "dd MMM, HH:mm")}
        </span>
      </div>
    </button>
  );
}
