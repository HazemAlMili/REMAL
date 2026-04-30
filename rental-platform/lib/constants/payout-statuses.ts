export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  Scheduled: "Scheduled",
  Paid: "Paid",
  Cancelled: "Cancelled",
};

export const PAYOUT_STATUS_COLORS: Record<string, "warning" | "info" | "success" | "danger"> = {
  Pending: "warning",
  Scheduled: "info",
  Paid: "success",
  Cancelled: "danger",
};
