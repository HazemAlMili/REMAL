import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

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
    <div className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-neutral-500" />

        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <span className="text-2xl font-semibold text-neutral-900">
            {value}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-500">{title}</p>
    </div>
  );
}
