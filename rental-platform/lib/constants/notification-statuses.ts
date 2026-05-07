import type { NotificationStatus } from "@/lib/types/notification.types";

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: "Pending",
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
  read: "Read",
};
