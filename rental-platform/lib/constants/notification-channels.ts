import type { NotificationChannel } from "@/lib/types/notification.types";
import type { BadgeVariant } from "@/components/ui/Badge";

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> =
  {
    Email: "Email",
    SMS: "SMS",
    InApp: "In-app",
  };

export const NOTIFICATION_CHANNEL_BADGE: Record<
  NotificationChannel,
  BadgeVariant
> = {
  Email: "info",
  SMS: "warning",
  InApp: "neutral",
};
