"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { StarRating } from "@/components/admin/reviews/StarRating";
import { PublishReviewDialog } from "@/components/admin/reviews/PublishReviewDialog";
import { RejectReviewDialog } from "@/components/admin/reviews/RejectReviewDialog";
import { HideReviewDialog } from "@/components/admin/reviews/HideReviewDialog";
import { ReviewStatusHistory } from "@/components/admin/reviews/ReviewStatusHistory";
import { useReviewStatusHistory } from "@/lib/hooks/useReviews";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { queryKeys } from "@/lib/hooks/query-keys";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { formatDate } from "@/lib/utils/format";
import {
  REVIEW_STATUS_BADGE,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants/review-statuses";
import type { ReviewDetailData } from "@/lib/types/review.types";
import { Button } from "@/components/ui/Button";

interface ReviewDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string | null;
  reviewData: ReviewDetailData | null;
  canModerate: boolean;
}

export function ReviewDetailDrawer({
  isOpen,
  onClose,
  reviewId,
  reviewData,
  canModerate,
}: ReviewDetailDrawerProps) {
  const queryClient = useQueryClient();

  // Status history query — only enabled when drawer is open and reviewId exists
  const { isLoading: isHistoryLoading } = useReviewStatusHistory(
    reviewId ?? ""
  );

  // Moderation dialog state
  const [publishDialog, setPublishDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [hideDialog, setHideDialog] = useState(false);

  // Mutations
  const publishMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) =>
      reviewsService.publish(reviewId, notes ? { notes } : undefined),
    onSuccess: () => {
      toastSuccess("Review published");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.publicByUnit(reviewData?.unitId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(reviewId ?? ""),
      });
      setPublishDialog(false);
    },
    onError: () => {
      toastError("Failed to publish review");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) =>
      reviewsService.reject(reviewId, notes ? { notes } : undefined),
    onSuccess: () => {
      toastSuccess("Review rejected");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.publicByUnit(reviewData?.unitId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(reviewId ?? ""),
      });
      setRejectDialog(false);
    },
    onError: () => {
      toastError("Failed to reject review");
    },
  });

  const hideMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) =>
      reviewsService.hide(reviewId, notes ? { notes } : undefined),
    onSuccess: () => {
      toastSuccess("Review hidden");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.publicByUnit(reviewData?.unitId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(reviewId ?? ""),
      });
      setHideDialog(false);
    },
    onError: () => {
      toastError("Failed to hide review");
    },
  });

  if (!reviewData || !reviewId) return null;

  // Render action buttons based on status
  const renderModerationActions = () => {
    if (!canModerate) return null;

    switch (reviewData.reviewStatus) {
      case "Pending":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setPublishDialog(true)}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setRejectDialog(true)}
            >
              Reject
            </Button>
          </div>
        );
      case "Published":
        return (
          <Button size="sm" variant="ghost" onClick={() => setHideDialog(true)}>
            Hide
          </Button>
        );
      case "Rejected":
      case "Hidden":
        return (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setPublishDialog(true)}
          >
            Publish
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title="Review Details">
        <div className="space-y-6">
          {/* Status + Rating */}
          <div className="flex items-center justify-between">
            <StatusBadge
              status={reviewData.reviewStatus}
              colorMap={REVIEW_STATUS_BADGE}
              labelMap={REVIEW_STATUS_LABELS}
            />
            <StarRating rating={reviewData.rating} size="md" readOnly />
          </div>

          {/* Title + Comment */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">
              {reviewData.title}
            </h3>
            {reviewData.comment && (
              <p className="mt-2 whitespace-pre-wrap text-neutral-600">
                {reviewData.comment}
              </p>
            )}
            {!reviewData.comment && (
              <p className="mt-2 text-sm italic text-neutral-400">
                No comment provided
              </p>
            )}
          </div>

          {/* Published Date */}
          <div className="text-sm text-neutral-500">
            Published: {formatDate(reviewData.publishedAt)}
          </div>

          {/* Owner Reply */}
          {reviewData.ownerReplyText && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="mb-1 text-xs font-medium uppercase text-neutral-500">
                Owner Reply
              </p>
              <p className="whitespace-pre-wrap text-neutral-700">
                {reviewData.ownerReplyText}
              </p>
              {reviewData.ownerReplyUpdatedAt && (
                <p className="mt-2 text-xs text-neutral-400">
                  Updated {formatDate(reviewData.ownerReplyUpdatedAt)}
                </p>
              )}
            </div>
          )}

          {/* Moderation Actions */}
          {canModerate && (
            <div className="border-t border-neutral-200 pt-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">
                Moderation Actions
              </p>
              {renderModerationActions()}
            </div>
          )}

          {/* Status History Timeline */}
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="mb-3 font-medium text-neutral-700">
              Status History
            </h4>
            {isHistoryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={60} className="rounded-md" />
                ))}
              </div>
            ) : (
              <ReviewStatusHistory reviewId={reviewId} />
            )}
          </div>
        </div>
      </Drawer>

      {/* Moderation Dialogs — embedded in drawer context */}
      <PublishReviewDialog
        isOpen={publishDialog}
        onClose={() => setPublishDialog(false)}
        onConfirm={(notes) =>
          publishMutation.mutate({ reviewId: reviewId, notes })
        }
        isLoading={publishMutation.isPending}
      />

      <RejectReviewDialog
        isOpen={rejectDialog}
        onClose={() => setRejectDialog(false)}
        onConfirm={(notes) =>
          rejectMutation.mutate({ reviewId: reviewId, notes })
        }
        isLoading={rejectMutation.isPending}
      />

      <HideReviewDialog
        isOpen={hideDialog}
        onClose={() => setHideDialog(false)}
        onConfirm={(notes) =>
          hideMutation.mutate({ reviewId: reviewId, notes })
        }
        isLoading={hideMutation.isPending}
      />
    </>
  );
}
