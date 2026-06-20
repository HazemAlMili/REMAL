export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const PAYOUT_STATUS_COLORS: Record<string, "warning" | "info" | "success" | "danger"> = {
  pending: "warning",
  scheduled: "info",
  paid: "success",
  cancelled: "danger",
};
