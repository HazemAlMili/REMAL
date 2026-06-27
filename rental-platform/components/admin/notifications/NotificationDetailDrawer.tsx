"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNEL_BADGE,
} from "@/lib/constants/notification-channels";
import type { NotificationListItemResponse } from "@/lib/types/notification.types";
import { NotificationBodyRenderer } from "@/lib/utils/notification-body";

interface NotificationDetailDrawerProps {
  notification: NotificationListItemResponse | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd dir="auto" className="text-end text-sm tabular-nums text-neutral-700">
        {value}
      </dd>
    </div>
  );
}

/**
 * Slide-in detail for a single notification, built on the shared Drawer so it
 * gets the portal's focus-trap, scroll-lock, reduced-motion, and backdrop for
 * free. The message is rendered with `dir="auto"` (see notification-body), so
 * English reads left-to-right and any future Arabic copy reads right-to-left.
 */
export function NotificationDetailDrawer({
  notification,
  onClose,
}: NotificationDetailDrawerProps) {
  const isUnread = notification?.readAt === null;

  return (
    <Drawer isOpen={!!notification} onClose={onClose} title="Notification">
      {notification && (
        <div className="space-y-6">
          {/* Subject + status */}
          <div className="space-y-3">
            <h3
              dir="auto"
              className="text-base font-semibold leading-snug text-neutral-900"
            >
              {notification.subject ?? "—"}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={NOTIFICATION_CHANNEL_BADGE[notification.channel]}
                size="sm"
              >
                {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
              </Badge>
              {isUnread ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--portal-radius-control)] border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  Unread
                </span>
              ) : (
                <span className="inline-flex items-center rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                  Read
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Message
            </h4>
            <div className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 px-4 py-3.5">
              <NotificationBodyRenderer body={notification.body} structured />
            </div>
          </section>

          {/* Details */}
          <section>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Details
            </h4>
            <dl className="divide-y divide-neutral-100">
              <DetailRow label="From" value={notification.senderLabel} />
              <DetailRow
                label="Created"
                value={format(
                  new Date(notification.createdAt),
                  "d MMM yyyy, HH:mm"
                )}
              />
              {notification.sentAt && (
                <DetailRow
                  label="Sent"
                  value={format(new Date(notification.sentAt), "d MMM yyyy, HH:mm")}
                />
              )}
              {notification.readAt && (
                <DetailRow
                  label="Read"
                  value={format(new Date(notification.readAt), "d MMM yyyy, HH:mm")}
                />
              )}
            </dl>
          </section>

          {/* ID */}
          <p className="border-t border-neutral-100 pt-4 text-[11px] text-neutral-400">
            ID{" "}
            <span className="font-mono text-neutral-500">
              {notification.notificationId}
            </span>
          </p>
        </div>
      )}
    </Drawer>
  );
}
