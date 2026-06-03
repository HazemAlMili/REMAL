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
import type { ReviewResponse } from "@/lib/types/review.types";
import type { ReviewStatus } from "@/lib/types/review.types";
import { MessageSquare } from "lucide-react";

interface ReviewTableProps {
  reviews: ReviewResponse[];
  isLoading: boolean;
  statusFilter: ReviewStatus | "All";
  onStatusFilterChange: (status: ReviewStatus | "All") => void;
  onAction: (reviewId: string, action: "publish" | "reject" | "hide") => void;
  onRowClick: (reviewId: string) => void;
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {/* Skeleton header */}
      <div className="h-10 w-full bg-neutral-100 rounded animate-pulse" />
      {/* Skeleton rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton width={120} height={24} />
          <Skeleton width={120} height={24} />
          <Skeleton width={100} height={24} />
          <Skeleton width={300} height={24} />
          <Skeleton width={80} height={24} />
          <Skeleton width={100} height={24} />
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
      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="No reviews match the current filter."
          icon={<MessageSquare size={48} />}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="p-4 font-medium">Property</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Comment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Submitted</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                  onClick={() => onRowClick(review.id)}
                >
                  <td className="p-4 text-sm font-medium text-neutral-900">
                    {review.unitName ?? "Deleted Unit"}
                  </td>
                  <td className="p-4 text-sm text-neutral-700">
                    {review.clientName ?? "Deleted Client"}
                  </td>
                  <td className="p-4">
                    <StarRating rating={review.rating} size="sm" readOnly />
                  </td>
                  <td className="max-w-[250px] p-4 text-sm text-neutral-600">
                    <div className="truncate font-medium text-neutral-800">
                      {review.title}
                    </div>
                    {review.comment && (
                      <div className="truncate text-xs text-neutral-400 mt-0.5">
                        {review.comment}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge
                      status={review.reviewStatus}
                      colorMap={REVIEW_STATUS_BADGE}
                      labelMap={REVIEW_STATUS_LABELS}
                    />
                  </td>
                  <td className="p-4 text-sm text-neutral-500">
                    {formatDate(review.submittedAt)}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      {review.reviewStatus === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onAction(review.id, "publish")}
                          >
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onAction(review.id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {review.reviewStatus === "Published" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction(review.id, "hide")}
                        >
                          Hide
                        </Button>
                      )}
                      {(review.reviewStatus === "Rejected" ||
                        review.reviewStatus === "Hidden") && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onAction(review.id, "publish")}
                        >
                          Publish
                        </Button>
                      )}
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
