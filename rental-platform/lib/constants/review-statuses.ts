export const REVIEW_STATUSES = {
  Pending: "Pending",
  Published: "Published",
  Rejected: "Rejected",
  Hidden: "Hidden",
} as const;

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  Pending: "Pending Review",
  Published: "Published",
  Rejected: "Rejected",
  Hidden: "Hidden",
};

export const REVIEW_STATUS_BADGE: Record<
  ReviewStatus,
  "warning" | "success" | "danger" | "neutral"
> = {
  Pending: "warning",
  Published: "success",
  Rejected: "danger",
  Hidden: "neutral",
};
