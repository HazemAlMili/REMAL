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
      <div className="h-9 w-full animate-pulse rounded-[var(--portal-radius-control)] bg-neutral-100" />
      {/* Skeleton rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
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
      <div className="flex gap-1 border-b border-neutral-200" role="tablist">
        {(["All", "Pending", "Published", "Rejected", "Hidden"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={statusFilter === status}
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
          title="No matching reviews"
          description="No reviews match the selected status or unit filter."
          icon={<MessageSquare size={48} />}
        />
      ) : (
        <div className="overflow-x-auto rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white">
          <table className="w-full text-start">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                <th className="px-3 py-2 font-semibold">Property</th>
                <th className="px-3 py-2 font-semibold">Client</th>
                <th className="px-3 py-2 font-semibold">Rating</th>
                <th className="px-3 py-2 font-semibold">Comment</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Submitted</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="cursor-pointer transition-colors hover:bg-neutral-50"
                  onClick={() => onRowClick(review.id)}
                >
                  <td className="h-[var(--portal-row-height)] px-3 py-2 text-sm font-medium text-neutral-900">
                    {review.unitName ?? "Deleted unit"}
                  </td>
                  <td className="h-[var(--portal-row-height)] px-3 py-2 text-sm text-neutral-700">
                    {review.clientName ?? "Deleted client"}
                  </td>
                  <td className="h-[var(--portal-row-height)] px-3 py-2">
                    <StarRating rating={review.rating} size="sm" readOnly />
                  </td>
                  <td className="h-[var(--portal-row-height)] max-w-[250px] px-3 py-2 text-sm text-neutral-600">
                    <div className="truncate font-medium text-neutral-800">
                      {review.title}
                    </div>
                    {review.comment && (
                      <div className="mt-0.5 truncate text-xs text-neutral-400">
                        {review.comment}
                      </div>
                    )}
                  </td>
                  <td className="h-[var(--portal-row-height)] px-3 py-2">
                    <StatusBadge
                      status={review.reviewStatus}
                      colorMap={REVIEW_STATUS_BADGE}
                      labelMap={REVIEW_STATUS_LABELS}
                    />
                  </td>
                  <td className="h-[var(--portal-row-height)] px-3 py-2 text-sm text-neutral-500">
                    {formatDate(review.submittedAt)}
                  </td>
                  <td
                    className="h-[var(--portal-row-height)] px-3 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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
