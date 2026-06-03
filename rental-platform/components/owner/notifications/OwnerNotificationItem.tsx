"use client";

import { useState } from "react";
import { useMarkOwnerNotificationRead } from "@/lib/hooks/useNotifications";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";
import { formatRelativeTimeSafe } from "@/lib/utils/format";
import { NotificationBodyRenderer } from "@/lib/utils/notification-body";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
  const [isOpen, setIsOpen] = useState(false);

  // Per P27: readAt === null means unread
  const isUnread = notification.readAt === null;

  const handleClick = () => {
    if (isUnread) {
      markReadMutation.mutate(notification.notificationId);
    }
    setIsOpen(true);
  };

  return (
    <>
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
            dir="rtl"
            className={[
              "text-sm text-right",
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
              {formatRelativeTimeSafe(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={notification.subject ?? "Notification Details"}
        size="md"
      >
        <div className="space-y-4">
          {/* BiDi-safe body with structured sentence splitting */}
          <div className="rounded-lg bg-neutral-50 px-4 py-4 break-words">
            <NotificationBodyRenderer
              body={notification.body}
              structured
            />
          </div>
          <div className="flex items-center gap-2 border-t border-neutral-100 pt-4 text-xs text-neutral-400">
            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-600">
              {CHANNEL_LABELS[notification.channel] || notification.channel}
            </span>
            <span>•</span>
            <span>{formatRelativeTimeSafe(notification.createdAt)}</span>
          </div>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}

