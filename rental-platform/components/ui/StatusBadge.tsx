"use client";

import * as React from "react";
import { Badge, BadgeVariant } from "./Badge";
import { getStatusLabel, getStatusVariant } from "@/lib/utils/status";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  colorMap?: Record<string, BadgeVariant>;
  labelMap?: Record<string, string>;
}

export function StatusBadge({
  status,
  label,
  colorMap,
  labelMap,
}: StatusBadgeProps) {
  const variant = getStatusVariant(status, colorMap) as BadgeVariant;
  const text = label ?? getStatusLabel(status, labelMap);

  return <Badge variant={variant}>{text}</Badge>;
}
