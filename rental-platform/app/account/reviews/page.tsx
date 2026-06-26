"use client";
import { useState } from "react";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ReviewForm } from "@/components/public/account/ReviewForm";
import { ReviewCard } from "@/components/public/account/ReviewCard";
import { useClientBookings } from "@/lib/hooks/useClient";
import {
  useCreateClientReview,
  useUpdateClientReview,
} from "@/lib/hooks/useClientReviews";
import { clientService } from "@/lib/api/services/client.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { useReviewsUIStore } from "@/lib/stores";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { isBookingStatus } from "@/lib/utils/status";
import { toastSuccess } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import {
  Star,
  CalendarCheck,
  MessageSquare,
  Calendar,
  Home,
} from "lucide-react";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";
import type { ReviewFormData } from "@/lib/validations/review";

export default function AccountReviewsPage() {
  const { data, isLoading: bookingsLoading } = useClientBookings({
    page: 1,
    pageSize: 100, // Fetch up to 100 bookings to get complete history
  });
  const bookings = data?.items ?? [];

  // filter completed bookings (case-insensitive — API enums may be lowercase)
  const completedBookings = bookings.filter((b) =>
    isBookingStatus(b.bookingStatus, "Completed")
  );

  // Fetch reviews for completed bookings in parallel using useQueries
  const reviewQueries = useQueries({
    queries: completedBookings.map((booking) => ({
      queryKey: queryKeys.clientReviews.byBooking(booking.id),
      queryFn: () => clientService.getReviewByBooking(booking.id),
      staleTime: 1000 * 60 * 5,
      retry: false,
    })),
  });

  const reviewsLoading = reviewQueries.some((q) => q.isLoading);

  // Zustand UI States
  const {
    activeTab,
    selectedBooking,
    selectedReview,
    isModalOpen,
    reviewMode,
    submitError,
    setActiveTab,
    openCreateReview,
    openEditReview,
    closeReviewModal,
    setSubmitError,
  } = useReviewsUIStore();

  const [isMutating, setIsMutating] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useCreateClientReview();
  const updateMutation = useUpdateClientReview();

  // Parse list of completed bookings that await reviews vs those already reviewed
  const awaitingReviewList: typeof completedBookings = [];
  const feedbackHistoryList: Array<{
    booking: (typeof completedBookings)[number];
    review: ClientReviewByBookingResponse;
  }> = [];

  if (!reviewsLoading && !bookingsLoading) {
    completedBookings.forEach((booking, index) => {
      const query = reviewQueries[index];
      if (query && query.data === null) {
        awaitingReviewList.push(booking);
      } else if (query && query.data) {
        feedbackHistoryList.push({
          booking,
          review: query.data,
        });
      }
    });
  }

  // Calculate statistics for grid header dashboard blocks
  const totalReviews = feedbackHistoryList.length;
  const averageRating =
    totalReviews > 0
      ? (
          feedbackHistoryList.reduce(
            (acc, item) => acc + item.review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  const getNightsCount = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleReviewSubmit = async (formData: ReviewFormData) => {
    if (!selectedBooking) return;
    setSubmitError(null);
    setIsMutating(true);
    try {
      if (reviewMode === "create") {
        await createMutation.mutateAsync({
          bookingId: selectedBooking.id,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment || undefined,
        });
        toastSuccess("Review submitted successfully!");
      } else if (reviewMode === "edit" && selectedReview) {
        await updateMutation.mutateAsync({
          reviewId: selectedReview.id,
          data: {
            rating: formData.rating,
            title: formData.title,
            comment: formData.comment || "",
          },
        });
        toastSuccess("Review updated successfully!");
      }

      // Invalidate specific cache paths
      await queryClient.invalidateQueries({
        queryKey: queryKeys.clientReviews.byBooking(selectedBooking.id),
      });

      closeReviewModal();
    } catch (err: unknown) {
      let message = "Failed to submit review. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object"
      ) {
        const response = err.response as {
          data?: { message?: string; errors?: string[] };
        };
        message =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to submit review. Please try again.";
      } else if (err && typeof err === "object" && "message" in err) {
        message = (err as { message?: string }).message ?? message;
      }
      setSubmitError(message);
    } finally {
      setIsMutating(false);
    }
  };

  const showSkeleton = bookingsLoading || reviewsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Reviews
        </h1>
        <p className="mt-1 text-neutral-600">
          Write reviews for your past stays and manage submitted feedback
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Completed stays
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-neutral-900">
              {completedBookings.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="bg-success/10 rounded-lg p-3 text-success">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Reviews written
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-neutral-900">
              {totalReviews}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-center rounded-lg bg-amber-50 p-3">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Average rating
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-neutral-900">
              {averageRating}{" "}
              <span className="text-sm font-medium text-neutral-500">
                / 5.0
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("awaiting")}
          aria-current={activeTab === "awaiting" ? "true" : undefined}
          className={cn(
            "-mb-px flex h-11 items-center border-b-2 px-6 text-sm transition-colors",
            activeTab === "awaiting"
              ? "border-primary-500 font-semibold text-neutral-900"
              : "border-transparent font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          )}
        >
          Awaiting review{" "}
          <span className="ml-1 tabular-nums">
            ({awaitingReviewList.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          aria-current={activeTab === "feedback" ? "true" : undefined}
          className={cn(
            "-mb-px flex h-11 items-center border-b-2 px-6 text-sm transition-colors",
            activeTab === "feedback"
              ? "border-primary-500 font-semibold text-neutral-900"
              : "border-transparent font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          )}
        >
          My feedback history{" "}
          <span className="ml-1 tabular-nums">
            ({feedbackHistoryList.length})
          </span>
        </button>
      </div>

      {/* Main content region */}
      {showSkeleton && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
              <div className="h-3 w-3/4 rounded bg-neutral-200" />
              <div className="mt-4 h-10 w-full rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      )}

      {!showSkeleton && activeTab === "awaiting" && (
        <>
          {awaitingReviewList.length === 0 ? (
            <EmptyState
              title="All stays reviewed!"
              description="Thank you for sharing your feedback on all your past Completed stays."
              icon={<CalendarCheck className="h-12 w-12 text-neutral-300" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {awaitingReviewList.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      <Home className="h-4 w-4 shrink-0 text-neutral-400" />
                      <span className="truncate">
                        {booking.unitName ?? "Property"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="mt-0.5 tabular-nums text-neutral-800">
                          {formatDate(booking.checkInDate)} -{" "}
                          {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Nights</p>
                        <p className="mt-0.5 tabular-nums text-neutral-800">
                          {getNightsCount(
                            booking.checkInDate,
                            booking.checkOutDate
                          )}{" "}
                          nights
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="mt-0.5 tabular-nums text-neutral-800">
                          {booking.guestCount} guests
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Total paid</p>
                        <p className="mt-0.5 tabular-nums text-neutral-800">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => openCreateReview(booking)}
                  >
                    Write review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!showSkeleton && activeTab === "feedback" && (
        <>
          {feedbackHistoryList.length === 0 ? (
            <EmptyState
              title="No feedback submitted yet"
              description="Once you write reviews for Completed stays, they will appear here along with their moderation status."
              icon={<MessageSquare className="h-12 w-12 text-neutral-300" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {feedbackHistoryList.map(({ booking, review }) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  unitName={booking.unitName ?? "Property"}
                  onEdit={() => openEditReview(booking, review)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Submission / Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeReviewModal}
        title={reviewMode === "create" ? "Write a Review" : "Edit Your Review"}
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header stay summary */}
            <div className="space-y-1 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="truncate font-semibold text-neutral-900">
                {selectedBooking.unitName ?? "Property"}
              </p>
              <p className="tabular-nums">
                Stay dates: {formatDate(selectedBooking.checkInDate)} -{" "}
                {formatDate(selectedBooking.checkOutDate)}
              </p>
            </div>

            <ReviewForm
              mode={reviewMode}
              existingReview={selectedReview}
              onSubmit={handleReviewSubmit}
              isSubmitting={isMutating}
              error={submitError}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
