"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNEL_BADGE,
} from "@/lib/constants/notification-channels";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";
import { NotificationBodyRenderer } from "@/lib/utils/notification-body";

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
    // Always open the detail drawer
    onSelect(notification);
    // Also mark as read if currently unread (idempotent on the server)
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
      className={`
        relative w-full rounded-lg border p-4 text-left transition-colors
        ${
          isUnread
            ? "border-primary-100 bg-primary-50 hover:bg-primary-100"
            : "border-neutral-200 bg-white hover:bg-neutral-50"
        }
        ${isMarkingRead ? "cursor-wait opacity-70" : "cursor-pointer"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Subject — NOT "title" per P27 */}
          <p
            dir="rtl"
            className={`text-sm text-right ${isUnread ? "font-semibold text-neutral-800" : "font-normal text-neutral-600"}`}
          >
            {notification.subject}
          </p>
          {/* Body preview — BiDi-safe, truncated to 2 lines */}
          <div dir="rtl" className="mt-1 line-clamp-2 text-right">
            <NotificationBodyRenderer
              body={notification.body}
              structured={false}
              className="text-xs text-neutral-500"
            />
          </div>
          {/* Sender label */}
          <p className="mt-1 text-[11px] text-neutral-400">
            من: {notification.senderLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {/* Channel badge */}
          <Badge variant={NOTIFICATION_CHANNEL_BADGE[notification.channel]}>
            {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
          </Badge>
          {/* Timestamp */}
          <span className="text-[11px] text-neutral-400">
            {format(new Date(notification.createdAt), "dd MMM, HH:mm")}
          </span>
        </div>
      </div>

      {/* Unread indicator dot */}
      {isUnread && (
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary-500" />
      )}
    </button>
  );
}

