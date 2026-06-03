"use client";
import { Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";

interface ReviewCardProps {
  review: ClientReviewByBookingResponse;
  unitName?: string;
  onEdit?: () => void;
}

export function ReviewCard({ review, unitName, onEdit }: ReviewCardProps) {
  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
    Published: "bg-green-50 text-green-700 ring-green-600/20",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20",
    Hidden: "bg-neutral-50 text-neutral-600 ring-neutral-500/10",
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card space-y-4">
      {/* Header with Title and Status Chip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {unitName && (
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              {unitName}
            </p>
          )}
          <h4 className="font-display text-base font-bold text-neutral-900 leading-tight">
            {review.title}
          </h4>
        </div>
        <div className="self-start">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
              statusStyles[review.reviewStatus] ||
                "bg-neutral-50 text-neutral-600 ring-neutral-500/10"
            )}
          >
            {review.reviewStatus}
          </span>
        </div>
      </div>

      {/* Star rating and date */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                review.rating >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-200"
              )}
            />
          ))}
        </div>
        <span>Submitted {formatDate(review.submittedAt)}</span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {/* Action Button: ONLY enable edit if Pending status */}
      {review.reviewStatus === "Pending" && onEdit && (
        <div className="flex justify-end pt-2 border-t border-neutral-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs transition-all hover:bg-neutral-50"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Review
          </Button>
        </div>
      )}
    </div>
  );
}
