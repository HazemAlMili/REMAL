import type { NotificationChannel } from "@/lib/types/notification.types";
import type { BadgeVariant } from "@/components/ui/Badge";

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> =
  {
    email: "Email",
    sms: "SMS",
    in_app: "In-app",
    whatsapp: "WhatsApp",
  };

export const NOTIFICATION_CHANNEL_BADGE: Record<
  NotificationChannel,
  BadgeVariant
> = {
  email: "info",
  sms: "warning",
  in_app: "neutral",
  whatsapp: "success",
};
