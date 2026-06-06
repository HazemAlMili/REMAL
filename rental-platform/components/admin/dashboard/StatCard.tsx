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
        "flex flex-col gap-3 rounded-[4px] border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="text-[28px] font-semibold leading-none tracking-tight text-neutral-900 tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
}
