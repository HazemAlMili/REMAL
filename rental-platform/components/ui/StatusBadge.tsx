"use client";

import * as React from "react";
import { Badge, BadgeVariant } from "./Badge";
import { BOOKING_STATUS_LABELS } from "@/lib/constants/booking-statuses";
import { CRM_STATUS_LABELS } from "@/lib/constants/booking-statuses";

export interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
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
const statusLabelMap: Record<string, string> = {
  ...CRM_STATUS_LABELS,
  ...BOOKING_STATUS_LABELS,
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = String(status);
  const variant = statusVariantMap[key] ?? "neutral";
  const text = label ?? statusLabelMap[key] ?? key;

  return <Badge variant={variant}>{text}</Badge>;
}

