import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

export interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  isLoading?: boolean;

  trend?: {
    value: number;
    direction: "up" | "down";
  };

  className?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group flex min-h-[112px] flex-col justify-between rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-neutral-600">
          {title}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-500" />
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="break-words text-[30px] font-semibold tabular-nums leading-none tracking-normal text-neutral-900">
          {value}
        </span>
      )}
    </div>
  );
}
