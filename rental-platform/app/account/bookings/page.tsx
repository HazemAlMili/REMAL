"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Modal } from "@/components/ui/Modal";
import { ReviewForm } from "@/components/public/account/ReviewForm";
import { useClientBookings, useBookingReview } from "@/lib/hooks/useClient";
import { useSubmitReview } from "@/lib/hooks/useReviews";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { isBookingStatus, normalizeStatus } from "@/lib/utils/status";
import { queryKeys } from "@/lib/utils/query-keys";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toastSuccess } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import { CalendarCheck, Home, Calendar, Users, CreditCard, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import type { BookingListItemResponse } from "@/lib/types/booking.types";
import type { ReviewFormData } from "@/lib/validations/review";

interface ReviewStatusIndicatorProps {
  bookingId: string;
}

function ReviewStatusIndicator({ bookingId }: ReviewStatusIndicatorProps) {
  const { data: review, isLoading } = useBookingReview(bookingId);

  if (isLoading) {
    return <span className="text-xs text-neutral-500">Loading…</span>;
  }

  if (!review) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-500/20">
        Write review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
      Review
      <StatusBadge status={review.reviewStatus} />
    </span>
  );
}

export default function ClientBookingsPage() {
  const { data, isLoading, isError } = useClientBookings({
    page: 1,
    pageSize: 20,
  });
  const bookings = data?.items ?? [];

  const [selectedBooking, setSelectedBooking] = useState<BookingListItemResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const submitMutation = useSubmitReview();

  // Query review details for selected booking (only when modal is open and booking is Completed)
  const { data: existingReview, isLoading: reviewLoading } = useBookingReview(
    selectedBooking?.id ?? "",
    !!selectedBooking && isBookingStatus(selectedBooking.bookingStatus, "Completed")
  );

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
    setIsSubmitting(true);
    try {
      if (!existingReview) {
        // Create review
        await submitMutation.mutateAsync({
          bookingId: selectedBooking.id,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment || undefined,
        });
      } else {
        // Edit review
        await api.put(endpoints.clientReviews.update(existingReview.id), {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment || "",
        });
      }

      // Invalidate target review queries so the view refreshes immediately
      await queryClient.invalidateQueries({
        queryKey: queryKeys.clientReviews.byBooking(selectedBooking.id),
      });

      toastSuccess(existingReview ? "Review updated!" : "Review submitted!");
      setShowReviewForm(false);
      setSelectedBooking(null); // close modal on success
    } catch (error: unknown) {
      let message = "Failed to submit review. Please try again.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object"
      ) {
        const response = error.response as {
          data?: { message?: string; errors?: string[] };
        };
        message =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to submit review. Please try again.";
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          My Bookings
        </h1>
      </div>

      {isLoading && <SkeletonTable rows={5} columns={6} />}

      {isError && (
        <EmptyState
          title="Bookings could not load"
          description="Refresh the page or try again after a moment."
          icon={<CalendarCheck className="h-12 w-12" />}
        />
      )}

      {!isLoading && !isError && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="When you submit booking requests, they'll appear here so you can track their status."
          icon={<CalendarCheck className="h-12 w-12" />}
          action={
            <Link href="/units">
              <Button>Browse Properties</Button>
            </Link>
          }
        />
      )}

      {!isLoading && !isError && bookings.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {bookings.map((booking) => {
                  const isCompleted = isBookingStatus(
                    booking.bookingStatus,
                    "Completed"
                  );
                  return (
                    <tr
                      key={booking.id}
                      className={cn(
                        "transition-colors",
                        isCompleted
                          ? "cursor-pointer hover:bg-neutral-50"
                          : "hover:bg-neutral-50/60"
                      )}
                      onClick={() => {
                        if (isCompleted) {
                          setSelectedBooking(booking);
                          setShowReviewForm(false);
                          setSubmitError(null);
                        }
                      }}
                    >
                      <td className="max-w-[16rem] truncate px-4 py-3 font-medium text-neutral-900">
                        {booking.unitName ?? "Property"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-600">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-600">
                        {booking.guestCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-neutral-900">
                        {formatCurrency(booking.finalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={booking.bookingStatus} />
                          {isCompleted && (
                            <ReviewStatusIndicator bookingId={booking.id} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-500">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {bookings.map((booking) => {
              const isCompleted = isBookingStatus(
                booking.bookingStatus,
                "Completed"
              );
              return (
                <div
                  key={booking.id}
                  className={cn(
                    "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors",
                    isCompleted ? "cursor-pointer hover:border-neutral-300" : ""
                  )}
                  onClick={() => {
                    if (isCompleted) {
                      setSelectedBooking(booking);
                      setShowReviewForm(false);
                      setSubmitError(null);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <Home className="h-4 w-4 shrink-0 text-neutral-400" />
                        <span className="truncate">{booking.unitName ?? "Property"}</span>
                      </div>
                      <p className="mt-2 text-sm tabular-nums text-neutral-600">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={booking.bookingStatus} />
                      {isCompleted && (
                        <ReviewStatusIndicator bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500">Guests</p>
                      <p className="font-medium tabular-nums text-neutral-900">
                        {booking.guestCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Total</p>
                      <p className="font-medium tabular-nums text-neutral-900">
                        {formatCurrency(booking.finalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Booking Details / Review Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => {
          setSelectedBooking(null);
          setShowReviewForm(false);
          setSubmitError(null);
        }}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col gap-4 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-neutral-900">
                  <Home className="h-5 w-5 shrink-0 text-neutral-400" />
                  <span className="truncate">{selectedBooking.unitName ?? "Property"}</span>
                </h3>
                <p className="mt-1 font-mono text-xs text-neutral-500">
                  ID: {selectedBooking.id}
                </p>
              </div>
              <div className="self-start sm:self-center">
                <StatusBadge status={selectedBooking.bookingStatus} />
              </div>
            </div>

            {/* Stay Metrics — single hairline panel, no nested cards */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-lg border border-neutral-200 bg-white p-5 lg:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Check-in
                </dt>
                <dd className="mt-1.5 text-sm font-semibold tabular-nums text-neutral-900">
                  {formatDate(selectedBooking.checkInDate)}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Check-out
                </dt>
                <dd className="mt-1.5 text-sm font-semibold tabular-nums text-neutral-900">
                  {formatDate(selectedBooking.checkOutDate)}
                </dd>
                <dd className="mt-0.5 text-xs tabular-nums text-neutral-500">
                  {getNightsCount(selectedBooking.checkInDate, selectedBooking.checkOutDate)} nights
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <Users className="h-3.5 w-3.5" />
                  Guests
                </dt>
                <dd className="mt-1.5 text-sm font-semibold tabular-nums text-neutral-900">
                  {selectedBooking.guestCount}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  Total paid
                </dt>
                <dd className="mt-1.5 text-sm font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(selectedBooking.finalAmount)}
                </dd>
              </div>
            </dl>

            {/* Review Section */}
            <div className="border-t border-neutral-200 pt-6">
              {reviewLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500" />
                  <p className="text-sm font-medium text-neutral-500">Checking review status…</p>
                </div>
              ) : showReviewForm ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to booking details
                    </button>
                  </div>
                  <ReviewForm
                    mode={existingReview ? "edit" : "create"}
                    existingReview={existingReview}
                    onSubmit={handleReviewSubmit}
                    isSubmitting={isSubmitting}
                    error={submitError}
                  />
                </div>
              ) : existingReview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight text-neutral-900">
                      Your review
                    </h4>
                    <StatusBadge status={existingReview.reviewStatus} />
                  </div>

                  <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-5 w-5",
                            existingReview.rating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-200"
                          )}
                        />
                      ))}
                    </div>
                    <h5 className="text-base font-semibold text-neutral-900">{existingReview.title}</h5>
                    {existingReview.comment && (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                        {existingReview.comment}
                      </p>
                    )}

                    {normalizeStatus(existingReview.reviewStatus) === "Pending" && (
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={() => setShowReviewForm(true)}
                      >
                        Edit review
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50/40 p-8 text-center">
                  <div className="rounded-full bg-amber-50 p-3">
                    <Star className="h-6 w-6 stroke-[1.5] text-amber-400" />
                  </div>
                  <h4 className="mt-4 font-semibold text-neutral-900">Share your experience</h4>
                  <p className="mt-1 max-w-sm text-sm text-neutral-500">
                    You haven&apos;t reviewed your stay at this property yet. Help other guests by leaving a review.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-5 px-6"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a review
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
