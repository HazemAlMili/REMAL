"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success border-success-bg",
  warning: "bg-warning-bg text-warning border-warning-bg",
  danger: "bg-error-bg text-error border-error-bg",
  info: "bg-info-bg text-info border-info-bg",
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] leading-4",
  md: "px-2.5 py-1 text-xs leading-4",
};

export function Badge({
  variant = "neutral",
  size = "md",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[var(--portal-radius-control)] border font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
