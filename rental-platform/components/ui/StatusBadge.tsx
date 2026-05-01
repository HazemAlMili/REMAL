"use client";

import * as React from "react";
import { Badge, BadgeVariant } from "./Badge";
import { BOOKING_STATUS_LABELS } from "@/lib/constants/booking-statuses";
import { CRM_STATUS_LABELS } from "@/lib/constants/booking-statuses";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  colorMap?: Record<string, BadgeVariant>;
  labelMap?: Record<string, string>;
}

const defaultStatusVariantMap: Record<string, BadgeVariant> = {
  Confirmed: "success",
  Completed: "success",
  Paid: "success",
  Issued: "success",
  Published: "success",
  Scheduled: "info",

  Pending: "warning",
  Prospecting: "warning",
  Relevant: "warning",
  NoAnswer: "warning",
  Draft: "warning",

  Cancelled: "danger",
  Rejected: "danger",
  Hidden: "danger",
  Failed: "danger",

  CheckIn: "info",
  LeftEarly: "warning",
  NotRelevant: "neutral",
};

// Merged label map: booking statuses take priority over CRM labels
const defaultStatusLabelMap: Record<string, string> = {
  ...CRM_STATUS_LABELS,
  ...BOOKING_STATUS_LABELS,
};

export function StatusBadge({
  status,
  label,
  colorMap,
  labelMap,
}: StatusBadgeProps) {
  const key = String(status);
  const variant = (colorMap?.[key] ??
    defaultStatusVariantMap[key] ??
    "neutral") as BadgeVariant;
  const text = label ?? labelMap?.[key] ?? defaultStatusLabelMap[key] ?? key;

  return <Badge variant={variant}>{text}</Badge>;
}
