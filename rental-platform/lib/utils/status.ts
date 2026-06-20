import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUSES,
  CRM_LEAD_STATUSES,
  CRM_STATUS_LABELS,
} from "@/lib/constants/booking-statuses";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from "@/lib/constants/payment-statuses";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

const CRM_STATUS_COLORS: Record<string, StatusVariant> = {
  [CRM_LEAD_STATUSES.Prospecting]: "warning",
  [CRM_LEAD_STATUSES.Relevant]: "warning",
  [CRM_LEAD_STATUSES.NoAnswer]: "warning",
  [CRM_LEAD_STATUSES.NotRelevant]: "neutral",
  [CRM_LEAD_STATUSES.Booked]: "info",
  [CRM_LEAD_STATUSES.Confirmed]: "success",
  [CRM_LEAD_STATUSES.CheckIn]: "info",
  [CRM_LEAD_STATUSES.Completed]: "success",
  [CRM_LEAD_STATUSES.Cancelled]: "danger",
  [CRM_LEAD_STATUSES.LeftEarly]: "warning",
};

const GENERIC_STATUS_LABELS: Record<string, string> = {
  Draft: "Draft",
  Failed: "Failed",
  Hidden: "Hidden",
  Issued: "Issued",
  Paid: "Paid",
  Pending: "Pending",
  Published: "Published",
  Rejected: "Rejected",
  Scheduled: "Scheduled",
};

const GENERIC_STATUS_COLORS: Record<string, StatusVariant> = {
  Draft: "warning",
  Failed: "danger",
  Hidden: "danger",
  Issued: "success",
  Paid: "success",
  Pending: "warning",
  Published: "success",
  Rejected: "danger",
  Scheduled: "info",
};

const STATUS_LABELS: Record<string, string> = {
  ...GENERIC_STATUS_LABELS,
  ...CRM_STATUS_LABELS,
  ...BOOKING_STATUS_LABELS,
  ...PAYMENT_STATUS_LABELS,
};

const STATUS_COLORS: Record<string, StatusVariant> = {
  ...GENERIC_STATUS_COLORS,
  ...CRM_STATUS_COLORS,
  ...(BOOKING_STATUS_COLORS as Record<string, StatusVariant>),
  ...(PAYMENT_STATUS_COLORS as Record<string, StatusVariant>),
};

const KNOWN_STATUS_KEYS = [
  ...Object.values(BOOKING_STATUSES),
  ...Object.values(CRM_LEAD_STATUSES),
  ...Object.values(PAYMENT_STATUSES),
  ...Object.keys(GENERIC_STATUS_LABELS),
];

const STATUS_LOOKUP = KNOWN_STATUS_KEYS.reduce<Record<string, string>>(
  (lookup, status) => {
    lookup[status.toLowerCase()] = status;
    return lookup;
  },
  {}
);

export function normalizeStatus(status: string | null | undefined): string {
  const rawStatus = String(status ?? "").trim();
  if (!rawStatus) return "";

  return STATUS_LOOKUP[rawStatus.toLowerCase()] ?? rawStatus;
}

export function getStatusLabel(
  status: string | null | undefined,
  labelMap?: Record<string, string>
): string {
  const rawStatus = String(status ?? "").trim();
  const normalizedStatus = normalizeStatus(rawStatus);

  return (
    labelMap?.[rawStatus] ??
    labelMap?.[normalizedStatus] ??
    STATUS_LABELS[normalizedStatus] ??
    normalizedStatus
  );
}

export function getStatusVariant(
  status: string | null | undefined,
  colorMap?: Record<string, StatusVariant>
): StatusVariant {
  const rawStatus = String(status ?? "").trim();
  const normalizedStatus = normalizeStatus(rawStatus);

  return (
    colorMap?.[rawStatus] ??
    colorMap?.[normalizedStatus] ??
    STATUS_COLORS[normalizedStatus] ??
    "neutral"
  );
}

export function isBookingStatus(
  status: string | null | undefined,
  targetStatus: string
): boolean {
  return normalizeStatus(status) === normalizeStatus(targetStatus);
}
