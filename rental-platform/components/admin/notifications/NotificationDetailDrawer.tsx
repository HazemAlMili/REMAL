"use client";

import { format } from "date-fns";
import { X, User, Clock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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

/**
 * Slide-in side drawer that shows the full detail of a notification item.
 *
 * Design decisions:
 * - Uses an overlay + slide-in panel rather than a modal so the list stays
 *   visible and contextual on larger screens.
 * - The body is rendered inside a `<div dir="auto">` so that Arabic RTL text
 *   renders correctly alongside English LTR copy without extra configuration.
 * - Raw template tokens (e.g. {unitName}) should never appear here because the
 *   backend compiles them before persisting the `body` column. If they somehow
 *   do appear, they are shown as-is — no client-side sanitisation is needed
 *   because body is plain text (not HTML).
 */
export function NotificationDetailDrawer({
  notification,
  onClose,
}: NotificationDetailDrawerProps) {
  if (!notification) return null;

  const isUnread = notification.readAt === null;

  const formattedDate = format(
    new Date(notification.createdAt),
    "EEEE, d MMMM yyyy — HH:mm"
  );

  const sentDate = notification.sentAt
    ? format(new Date(notification.sentAt), "d MMM yyyy, HH:mm")
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notification detail"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div className="min-w-0 flex-1 pr-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Notification Detail
            </p>
            <h2
              dir="rtl"
              className="text-base font-semibold leading-snug text-neutral-800 text-right"
            >
              {notification.subject ?? "—"}
            </h2>
          </div>
          <button
            id="notification-detail-close"
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close notification detail"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Metadata strip ── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-6 py-3">
          {/* Channel */}
          <Badge variant={NOTIFICATION_CHANNEL_BADGE[notification.channel]}>
            {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
          </Badge>

          {/* Read status */}
          {isUnread ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              Unread
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
              Read
            </span>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Sender */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Sender
              </p>
              <p
                dir="auto"
                className="mt-0.5 text-sm font-semibold text-neutral-800"
              >
                {notification.senderLabel}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Created
              </p>
              <p className="mt-0.5 text-sm text-neutral-700">{formattedDate}</p>
              {sentDate && (
                <>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Sent
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-700">{sentDate}</p>
                </>
              )}
              {notification.readAt && (
                <>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Read
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-700">
                    {format(new Date(notification.readAt), "d MMM yyyy, HH:mm")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Full body */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Message
              </p>
              {/* BiDi-safe renderer: isolates LTR tokens inside <bdi> tags,
                  applies leading-loose typography, and splits on Arabic commas
                  into structured vertical fragments for easy scanning. */}
              <div className="mt-2 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-4 break-words">
                <NotificationBodyRenderer
                  body={notification.body}
                  structured
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-neutral-200 px-6 py-4">
          <p className="text-center text-xs text-neutral-400">
            Notification ID:{" "}
            <span className="font-mono text-neutral-500">
              {notification.notificationId}
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}
