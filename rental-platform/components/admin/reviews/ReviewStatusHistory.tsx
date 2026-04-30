"use client";

import { useReviewStatusHistory } from "@/lib/hooks/useReviews";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils/format";
import { Clock } from "lucide-react";

interface ReviewStatusHistoryProps {
  reviewId: string;
}

export function ReviewStatusHistory({ reviewId }: ReviewStatusHistoryProps) {
  const { data: history, isLoading, error } = useReviewStatusHistory(reviewId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} className="rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-error">Could not load status history</p>;
  }

  if (!history || history.length === 0) {
    return (
      <EmptyState
        title="No status changes yet"
        icon={<Clock size={32} />}
        className="min-h-[150px]"
      />
    );
  }

  // Render newest-first
  const sorted = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-neutral-200" />

      <ul className="space-y-4">
        {sorted.map((entry) => (
          <li key={entry.id} className="relative pl-6">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-primary-500 bg-primary-100" />

            <div className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-800">
                  {entry.oldStatus ?? "Created"} → {entry.newStatus}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                By {entry.changedByAdminUserId} • {formatDate(entry.changedAt)}
              </div>
              {entry.notes && (
                <p className="mt-1 italic text-neutral-600">
                  &quot;{entry.notes}&quot;
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
