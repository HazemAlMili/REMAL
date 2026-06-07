"use client";
import { Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import { normalizeStatus } from "@/lib/utils/status";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";

interface ReviewCardProps {
  review: ClientReviewByBookingResponse;
  unitName?: string;
  onEdit?: () => void;
}

export function ReviewCard({ review, unitName, onEdit }: ReviewCardProps) {
  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Header with Title and Status Chip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {unitName && (
            <p className="mb-1 truncate text-xs font-medium text-neutral-500">
              {unitName}
            </p>
          )}
          <h4 className="text-base font-semibold leading-tight tracking-tight text-neutral-900">
            {review.title}
          </h4>
        </div>
        <div className="self-start">
          <StatusBadge status={review.reviewStatus} />
        </div>
      </div>

      {/* Star rating and date */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
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
        <span className="tabular-nums">Submitted {formatDate(review.submittedAt)}</span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {/* Owner Reply Block */}
      {review.ownerReplyText && review.ownerReplyText.trim() && (
        <div
          className="break-words rounded-lg border border-neutral-200 bg-neutral-50 p-3"
          dir="rtl"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-neutral-700">رد المالك</span>
            {review.ownerReplyUpdatedAt && (
              <span className="shrink-0 text-[10px] tabular-nums text-neutral-500">
                {formatRelativeTime(review.ownerReplyUpdatedAt)}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
            <bdi>{review.ownerReplyText}</bdi>
          </p>
        </div>
      )}

      {/* Action Button: ONLY enable edit if Pending status */}
      {normalizeStatus(review.reviewStatus) === "Pending" && onEdit && (
        <div className="flex justify-end border-t border-neutral-200 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit review
          </Button>
        </div>
      )}
    </div>
  );
}
