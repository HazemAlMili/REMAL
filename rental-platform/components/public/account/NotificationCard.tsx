// ═══════════════════════════════════════════════════════════
// components/public/account/NotificationCard.tsx
// Individual notification card — P27 corrected
// ═══════════════════════════════════════════════════════════

"use client";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { Mail, MessageSquare, Bell, Check } from "lucide-react";
import type { ClientNotification } from "@/lib/types/client.types";
import type { BadgeVariant } from "@/components/ui/Badge";

// Channel icon mapping
const CHANNEL_CONFIG = {
  Email: { icon: Mail, variant: "info" as BadgeVariant },
  SMS: { icon: MessageSquare, variant: "success" as BadgeVariant },
  InApp: { icon: Bell, variant: "neutral" as BadgeVariant },
};

interface NotificationCardProps {
  notification: ClientNotification;
  onMarkRead: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  // P27: readAt === null means unread
  const isUnread = notification.readAt === null; // NOT notification.isRead

  // Get channel config with guaranteed fallback
  const channelConfig =
    CHANNEL_CONFIG[notification.channel as keyof typeof CHANNEL_CONFIG] ||
    CHANNEL_CONFIG.InApp;

  return (
    <div
      className={`
        cursor-pointer rounded-xl border p-4 transition-colors
        ${
          isUnread
            ? "border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10"
            : "border-neutral-100 bg-white hover:bg-neutral-50"
        }
      `}
      onClick={() => {
        if (isUnread) {
          onMarkRead(notification.id);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator dot */}
        {isUnread && (
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
        )}
        {!isUnread && <div className="mt-2 h-2 w-2 shrink-0" />}

        <div className="min-w-0 flex-1">
          {/* Subject + Channel Badge */}
          <div className="mb-1 flex items-center gap-2">
            <h4
              className={`line-clamp-1 text-sm ${
                isUnread
                  ? "font-semibold text-neutral-900"
                  : "font-medium text-neutral-700"
              }`}
            >
              {notification.subject} {/* P27: subject, NOT title */}
            </h4>
            <Badge variant={channelConfig.variant}>
              {notification.channel}
            </Badge>
          </div>

          {/* Body */}
          <p className="line-clamp-2 text-sm text-neutral-600">
            {notification.body}
          </p>

          {/* Timestamp */}
          <p className="mt-2 text-xs text-neutral-400">
            {formatRelativeTime(notification.createdAt)}{" "}
            {/* P27: createdAt, was missing */}
          </p>
        </div>

        {/* Mark as read button (for unread items) */}
        {isUnread && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-primary-500"
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
