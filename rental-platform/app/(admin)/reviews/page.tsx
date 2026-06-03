"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReviewTable } from "@/components/admin/reviews/ReviewTable";
import { ReviewDetailDrawer } from "@/components/admin/reviews/ReviewDetailDrawer";
import { PublishReviewDialog } from "@/components/admin/reviews/PublishReviewDialog";
import { RejectReviewDialog } from "@/components/admin/reviews/RejectReviewDialog";
import { HideReviewDialog } from "@/components/admin/reviews/HideReviewDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { unitsService } from "@/lib/api/services/units.service";
import { queryKeys } from "@/lib/hooks/query-keys";
import { useAdminReviews } from "@/lib/hooks/useReviews";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import type { ReviewStatus, ReviewResponse } from "@/lib/types/review.types";
import { MessageSquare } from "lucide-react";

export default function ReviewsModerationPage() {
  const { canModerateReviews } = usePermissions();
  const queryClient = useQueryClient();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "All">("All");

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

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
    reviewData: ReviewResponse | null;
  }>({ isOpen: false, reviewId: null, reviewData: null });

  // Fetch units for the unit filter
  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: queryKeys.units.internalList({ pageSize: 100 }),
    queryFn: () => unitsService.getInternalList({ pageSize: 100 }),
  });

  // Fetch reviews using paged internal moderation endpoint
  const { data: reviewsData, isLoading: reviewsLoading } = useAdminReviews({
    reviewStatus: statusFilter === "All" ? undefined : statusFilter,
    unitId: selectedUnitId || undefined,
    page,
    pageSize,
  });

  // Reset page when filters change
  const handleStatusFilterChange = (status: ReviewStatus | "All") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleUnitFilterChange = (value: string) => {
    setSelectedUnitId(value);
    setPage(1);
  };

  // Mutations
  const publishMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) =>
      reviewsService.publish(reviewId, notes ? { notes } : undefined),
    onSuccess: () => {
      toastSuccess("Review published");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(publishDialog.reviewId),
      });
      setPublishDialog({ isOpen: false, reviewId: "" });
      // If drawer is currently open for this review, update its data
      if (detailDrawer.reviewId === publishDialog.reviewId && detailDrawer.reviewData) {
        setDetailDrawer((prev) => ({
          ...prev,
          reviewData: prev.reviewData ? { ...prev.reviewData, reviewStatus: "Published" } : null,
        }));
      }
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
        queryKey: queryKeys.reviews.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(rejectDialog.reviewId),
      });
      setRejectDialog({ isOpen: false, reviewId: "" });
      if (detailDrawer.reviewId === rejectDialog.reviewId && detailDrawer.reviewData) {
        setDetailDrawer((prev) => ({
          ...prev,
          reviewData: prev.reviewData ? { ...prev.reviewData, reviewStatus: "Rejected" } : null,
        }));
      }
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
        queryKey: queryKeys.reviews.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(hideDialog.reviewId),
      });
      setHideDialog({ isOpen: false, reviewId: "" });
      if (detailDrawer.reviewId === hideDialog.reviewId && detailDrawer.reviewData) {
        setDetailDrawer((prev) => ({
          ...prev,
          reviewData: prev.reviewData ? { ...prev.reviewData, reviewStatus: "Hidden" } : null,
        }));
      }
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
    const review = reviewsData?.items?.find((r) => r.id === reviewId);
    if (review) {
      setDetailDrawer({
        isOpen: true,
        reviewId: review.id,
        reviewData: review,
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
    { value: "", label: unitsLoading ? "Loading..." : "Filter by unit (All)..." },
    ...(unitsData?.items ?? []).map((u) => ({ value: u.id, label: u.name })),
  ];

  const reviewsList = reviewsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Reviews Moderation
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Monitor, approve, reject, or hide client reviews across all properties
          </p>
        </div>

        {/* Unit Selector filter */}
        <div className="w-full max-w-xs sm:w-72">
          <Select
            label="Filter Property"
            options={unitOptions}
            value={selectedUnitId}
            onChange={(value) => handleUnitFilterChange(value as string)}
            disabled={unitsLoading}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <ReviewTable
        reviews={reviewsList}
        isLoading={reviewsLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onAction={handleAction}
        onRowClick={handleRowClick}
      />

      {/* Pagination Controls */}
      {reviewsData && reviewsData.pagination && reviewsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-neutral-100 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(reviewsData.pagination.totalPages, p + 1))}
              disabled={page === reviewsData.pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, reviewsData.pagination.totalCount)}
                </span>{" "}
                of <span className="font-medium">{reviewsData.pagination.totalCount}</span> results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(reviewsData.pagination.totalPages, p + 1))}
                disabled={page === reviewsData.pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Dialogs */}
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

      {/* Review Detail Drawer */}
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
