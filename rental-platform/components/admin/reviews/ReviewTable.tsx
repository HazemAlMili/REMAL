"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "./StarRating";
import {
  REVIEW_STATUS_BADGE,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants/review-statuses";
import { formatDate } from "@/lib/utils/format";
import type { PublishedReviewListItemResponse } from "@/lib/types/review.types";
import type { ReviewStatus } from "@/lib/types/review.types";
import { MessageSquare } from "lucide-react";

// ⚠️ Using PublishedReviewListItemResponse as placeholder type.
// When internal reviews list endpoint is documented, replace with internal type.

interface ReviewTableProps {
  reviews: PublishedReviewListItemResponse[];
  isLoading: boolean;
  statusFilter: ReviewStatus | "All";
  onStatusFilterChange: (status: ReviewStatus | "All") => void;
  onAction: (reviewId: string, action: "publish" | "reject" | "hide") => void;
  onRowClick: (reviewId: string) => void;
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton width={100} height={40} />
          <Skeleton width={200} height={40} />
          <Skeleton width={300} height={40} />
          <Skeleton width={100} height={40} />
          <Skeleton width={120} height={40} />
          <Skeleton width={150} height={40} />
        </div>
      ))}
    </div>
  );
}

export function ReviewTable({
  reviews,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onAction,
  onRowClick,
}: ReviewTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={5} />;
  }

  // Client-side status filter (until backend supports server-side filter)
  // ⚠️ PublishedReviewListItemResponse doesn't have reviewStatus field
  // This filter will only work when internal list endpoint is available
  // For now, public reviews are all "Published" by definition
  const filteredReviews =
    statusFilter === "All"
      ? reviews
      : reviews.filter(() => {
          // Placeholder — cannot filter without reviewStatus field
          // When internal endpoint is available, use: r.reviewStatus === statusFilter
          return statusFilter === "Published"; // All public reviews are Published
        });

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        {(["All", "Pending", "Published", "Rejected", "Hidden"] as const).map(
          (status) => (
            <button
              key={status}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
              onClick={() => onStatusFilterChange(status)}
            >
              {status === "All"
                ? "All"
                : (REVIEW_STATUS_LABELS[status as ReviewStatus] ?? status)}
            </button>
          )
        )}
      </div>

      {/* Reviews table */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="No reviews match the current filter."
          icon={<MessageSquare size={48} />}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200 text-left text-sm text-neutral-600">
                <th className="p-3 font-medium">Rating</th>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Comment</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.reviewId}
                  className="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                  onClick={() => onRowClick(review.reviewId)}
                >
                  <td className="p-3">
                    <StarRating rating={review.rating} size="sm" readOnly />
                  </td>
                  <td className="p-3 text-sm font-medium text-neutral-800">
                    {review.title}
                  </td>
                  <td className="max-w-[250px] truncate p-3 text-sm text-neutral-500">
                    {review.comment ?? "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      status="Published"
                      colorMap={REVIEW_STATUS_BADGE}
                      labelMap={REVIEW_STATUS_LABELS}
                    />
                    {/* ⚠️ All public reviews are "Published" by definition.
                        Status badges will work properly when internal list endpoint is available. */}
                  </td>
                  <td className="p-3 text-sm text-neutral-500">
                    {formatDate(review.publishedAt)}
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    {/* Actions based on status — currently all are Published */}
                    {/* These will work properly when internal list endpoint provides reviewStatus */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onAction(review.reviewId, "hide")}
                      >
                        Hide
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
