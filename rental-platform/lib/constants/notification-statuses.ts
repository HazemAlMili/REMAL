import type { NotificationStatus } from "@/lib/types/notification.types";

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  Pending: "Pending",
  Queued: "Queued",
  Sent: "Sent",
  Delivered: "Delivered",
  Failed: "Failed",
  Cancelled: "Cancelled",
};
