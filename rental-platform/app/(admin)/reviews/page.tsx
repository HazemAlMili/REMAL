"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewTable } from "@/components/admin/reviews/ReviewTable";
import { ReviewDetailDrawer } from "@/components/admin/reviews/ReviewDetailDrawer";
import { PublishReviewDialog } from "@/components/admin/reviews/PublishReviewDialog";
import { RejectReviewDialog } from "@/components/admin/reviews/RejectReviewDialog";
import { HideReviewDialog } from "@/components/admin/reviews/HideReviewDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { unitsService } from "@/lib/api/services/units.service";
import { queryKeys } from "@/lib/hooks/query-keys";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import type { ReviewStatus, ReviewDetailData } from "@/lib/types/review.types";
import { MessageSquare, AlertTriangle } from "lucide-react";

export default function ReviewsModerationPage() {
  const { canModerateReviews } = usePermissions();
  const queryClient = useQueryClient();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "All">("All");

  // Dialog states
  const [publishDialog, setPublishDialog] = useState<{
    isOpen: boolean;
    reviewId: string;
  }>({ isOpen: false, reviewId: "" });
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    reviewId: string;
  }>({ isOpen: false, reviewId: "" });
  const [hideDialog, setHideDialog] = useState<{
    isOpen: boolean;
    reviewId: string;
  }>({ isOpen: false, reviewId: "" });

  // Detail drawer state
  const [detailDrawer, setDetailDrawer] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    reviewData: ReviewDetailData | null;
  }>({ isOpen: false, reviewId: null, reviewData: null });

  // Fetch units for the unit selector
  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: queryKeys.units.internalList({ pageSize: 100 }),
    queryFn: () => unitsService.getInternalList({ pageSize: 100 }),
  });

  // Fetch reviews for the selected unit
  // ⚠️ WORKAROUND: Using public endpoint which only returns PUBLISHED reviews
  // Replace with internal reviews list endpoint when backend provides it
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: queryKeys.reviews.publicByUnit(selectedUnitId),
    queryFn: () => reviewsService.getPublicByUnit(selectedUnitId),
    enabled: !!selectedUnitId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Mutations
  const publishMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) =>
      reviewsService.publish(reviewId, notes ? { notes } : undefined),
    onSuccess: () => {
      toastSuccess("Review published");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.publicByUnit(selectedUnitId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(publishDialog.reviewId),
      });
      setPublishDialog({ isOpen: false, reviewId: "" });
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
        queryKey: queryKeys.reviews.publicByUnit(selectedUnitId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(rejectDialog.reviewId),
      });
      setRejectDialog({ isOpen: false, reviewId: "" });
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
        queryKey: queryKeys.reviews.publicByUnit(selectedUnitId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(hideDialog.reviewId),
      });
      setHideDialog({ isOpen: false, reviewId: "" });
    },
    onError: () => {
      toastError("Failed to hide review");
    },
  });

  const handleAction = (
    reviewId: string,
    action: "publish" | "reject" | "hide"
  ) => {
    switch (action) {
      case "publish":
        setPublishDialog({ isOpen: true, reviewId });
        break;
      case "reject":
        setRejectDialog({ isOpen: true, reviewId });
        break;
      case "hide":
        setHideDialog({ isOpen: true, reviewId });
        break;
    }
  };

  const handleRowClick = (reviewId: string) => {
    // Find the review data from the list
    const review = reviews?.find((r) => r.reviewId === reviewId);
    if (review) {
      // Map PublishedReviewListItemResponse to ReviewDetailData
      const reviewData: ReviewDetailData = {
        reviewId: review.reviewId,
        unitId: review.unitId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        reviewStatus: "Published", // All public reviews are Published
        ownerReplyText: review.ownerReplyText,
        ownerReplyUpdatedAt: review.ownerReplyUpdatedAt,
        publishedAt: review.publishedAt,
      };
      setDetailDrawer({
        isOpen: true,
        reviewId: review.reviewId,
        reviewData,
      });
    }
  };

  if (!canModerateReviews) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            You don&apos;t have permission to moderate reviews.
          </p>
        </div>
      </div>
    );
  }

  const unitOptions = [
    { value: "", label: unitsLoading ? "Loading..." : "Select a unit..." },
    ...(unitsData?.items.map((u) => ({ value: u.id, label: u.name })) ?? []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Reviews Moderation
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage and moderate client reviews
        </p>
      </div>

      {/* Unit selector */}
      <div className="max-w-sm">
        <Select
          label="Select Unit"
          options={unitOptions}
          value={selectedUnitId}
          onChange={(value) => setSelectedUnitId(value as string)}
          disabled={unitsLoading}
        />
      </div>

      {/* Reviews table or empty state */}
      {!selectedUnitId ? (
        <EmptyState
          title="Select a unit"
          description="Select a unit to view its reviews."
          icon={<MessageSquare size={48} />}
        />
      ) : (
        <ReviewTable
          reviews={reviews ?? []}
          isLoading={reviewsLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAction={handleAction}
          onRowClick={handleRowClick}
        />
      )}

      {/* Backend gap warning — remove when internal endpoint is available */}
      {selectedUnitId && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Backend Gap: Limited Review Data
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                The current review list only shows published reviews. Pending,
                rejected, and hidden reviews require an internal reviews list
                endpoint (
                <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs">
                  GET /api/internal/reviews
                </code>
                ) which is not yet documented. Contact the backend team to
                enable full moderation functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Moderation dialogs */}
      <PublishReviewDialog
        isOpen={publishDialog.isOpen}
        onClose={() => setPublishDialog({ isOpen: false, reviewId: "" })}
        onConfirm={(notes) =>
          publishMutation.mutate({ reviewId: publishDialog.reviewId, notes })
        }
        isLoading={publishMutation.isPending}
      />

      <RejectReviewDialog
        isOpen={rejectDialog.isOpen}
        onClose={() => setRejectDialog({ isOpen: false, reviewId: "" })}
        onConfirm={(notes) =>
          rejectMutation.mutate({ reviewId: rejectDialog.reviewId, notes })
        }
        isLoading={rejectMutation.isPending}
      />

      <HideReviewDialog
        isOpen={hideDialog.isOpen}
        onClose={() => setHideDialog({ isOpen: false, reviewId: "" })}
        onConfirm={(notes) =>
          hideMutation.mutate({ reviewId: hideDialog.reviewId, notes })
        }
        isLoading={hideMutation.isPending}
      />

      {/* Review detail drawer */}
      <ReviewDetailDrawer
        isOpen={detailDrawer.isOpen}
        onClose={() =>
          setDetailDrawer({ isOpen: false, reviewId: null, reviewData: null })
        }
        reviewId={detailDrawer.reviewId}
        reviewData={detailDrawer.reviewData}
        canModerate={canModerateReviews}
      />
    </div>
  );
}
