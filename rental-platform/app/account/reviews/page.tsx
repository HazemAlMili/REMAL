"use client";
import { useState } from "react";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ReviewForm } from "@/components/public/account/ReviewForm";
import { ReviewCard } from "@/components/public/account/ReviewCard";
import { useClientBookings } from "@/lib/hooks/useClient";
import { useCreateClientReview, useUpdateClientReview } from "@/lib/hooks/useClientReviews";
import { clientService } from "@/lib/api/services/client.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { useReviewsUIStore } from "@/lib/stores";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toastSuccess } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import { Star, CalendarCheck, MessageSquare, Calendar, Home } from "lucide-react";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";
import type { ReviewFormData } from "@/lib/validations/review";

export default function AccountReviewsPage() {
  const { data, isLoading: bookingsLoading } = useClientBookings({
    page: 1,
    pageSize: 100, // Fetch up to 100 bookings to get complete history
  });
  const bookings = data?.items ?? [];

  // filter completed bookings
  const completedBookings = bookings.filter((b) => b.bookingStatus === "Completed");

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
    booking: typeof completedBookings[number];
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
          feedbackHistoryList.reduce((acc, item) => acc + item.review.rating, 0) /
          totalReviews
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
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Reviews
        </h1>
        <p className="mt-1 text-neutral-600">
          Write reviews for your past stays and manage submitted feedback
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card flex items-center gap-4">
          <div className="rounded-xl bg-primary-50 p-3 text-primary-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Completed Stays</p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {completedBookings.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card flex items-center gap-4">
          <div className="rounded-xl bg-green-50 p-3 text-green-500">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Reviews Written</p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {totalReviews}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-500 flex items-center justify-center">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Average Rating</p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">
              {averageRating} <span className="text-sm text-neutral-400 font-medium">/ 5.0</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("awaiting")}
          className={cn(
            "px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200",
            activeTab === "awaiting"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
          )}
        >
          Awaiting Review ({awaitingReviewList.length})
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={cn(
            "px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200",
            activeTab === "feedback"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
          )}
        >
          My Feedback History ({feedbackHistoryList.length})
        </button>
      </div>

      {/* Main Content Area */}
      {showSkeleton && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-neutral-100 bg-white p-5 shadow-card h-48 space-y-4"
            >
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
              <div className="h-3 bg-neutral-200 rounded w-3/4" />
              <div className="h-10 bg-neutral-200 rounded w-full mt-4" />
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
                  className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-card flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                      <Home className="h-4 w-4 text-neutral-400" />
                      {booking.unitName ?? "Property"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-neutral-800 mt-0.5">
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Nights</p>
                        <p className="text-neutral-800 mt-0.5">
                          {getNightsCount(booking.checkInDate, booking.checkOutDate)} nights
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="text-neutral-800 mt-0.5">{booking.guestCount} guests</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Paid</p>
                        <p className="text-neutral-800 mt-0.5">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openCreateReview(booking)}
                  >
                    Write Review
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
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 text-sm text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-900">{selectedBooking.unitName}</p>
              <p>
                Stay Dates: {formatDate(selectedBooking.checkInDate)} -{" "}
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
