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
  success: "bg-accent-green/15 text-accent-green border-accent-green/20",
  warning: "bg-accent-amber/15 text-accent-amber border-accent-amber/20",
  danger: "bg-error/15 text-error border-error/20",
  info: "bg-accent-blue/15 text-accent-blue border-accent-blue/20",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
