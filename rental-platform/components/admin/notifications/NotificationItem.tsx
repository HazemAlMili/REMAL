"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNEL_BADGE,
} from "@/lib/constants/notification-channels";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";

interface NotificationItemProps {
  notification: NotificationListItemResponse;
  onMarkRead: (notificationId: string) => void;
  isMarkingRead: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  isMarkingRead,
}: NotificationItemProps) {
  // Per P27: readAt === null means unread
  const isUnread = notification.readAt === null;

  const handleClick = () => {
    if (isUnread) {
      onMarkRead(notification.notificationId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isUnread || isMarkingRead}
      className={`
        relative w-full rounded-lg border p-4 text-left transition-colors
        ${
          isUnread
            ? "border-primary-100 bg-primary-50 hover:bg-primary-100"
            : "border-neutral-200 bg-white"
        }
        ${isMarkingRead ? "cursor-wait opacity-70" : isUnread ? "cursor-pointer" : "cursor-default"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Subject — NOT "title" per P27 */}
          <p
            className={`text-sm ${isUnread ? "font-semibold text-neutral-800" : "font-normal text-neutral-600"}`}
          >
            {notification.subject}
          </p>
          {/* Body — truncated to 2 lines */}
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
            {notification.body}
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
