"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[180px] flex-col items-center justify-center rounded-[var(--portal-radius-card)] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-neutral-400">{icon}</div>}
      <h3 className="text-base font-medium text-neutral-800">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
