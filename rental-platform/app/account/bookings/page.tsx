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
    return <span className="text-xs text-neutral-400">Loading...</span>;
  }

  if (!review) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/10">
        Write Review
      </span>
    );
  }

  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
    Published: "bg-green-50 text-green-700 ring-green-600/20",
    Rejected: "bg-red-50 text-red-700 ring-red-600/20",
    Hidden: "bg-neutral-50 text-neutral-600 ring-neutral-500/10",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[review.reviewStatus] || "bg-neutral-50 text-neutral-600 ring-neutral-500/10"
      }`}
    >
      Review: {review.reviewStatus}
    </span>
  );
}

export default function ClientBookingsPage() {
  const { data, isLoading, isError } = useClientBookings({
    page: 1,
    pageSize: 20,
  });
  const bookings = data?.items ?? [];
  console.log("CLIENT BOOKINGS FETCHED:", data);

  const [selectedBooking, setSelectedBooking] = useState<BookingListItemResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const submitMutation = useSubmitReview();

  // Query review details for selected booking (only when modal is open and booking is Completed)
  const { data: existingReview, isLoading: reviewLoading } = useBookingReview(
    selectedBooking?.id ?? "",
    !!selectedBooking && selectedBooking.bookingStatus === "Completed"
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
        <h1 className="font-display text-2xl font-bold text-neutral-900">
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
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="p-4 font-medium">Property</th>
                  <th className="p-4 font-medium">Dates</th>
                  <th className="p-4 font-medium">Guests</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={cn(
                      "transition-all duration-200",
                      booking.bookingStatus === "Completed"
                        ? "cursor-pointer hover:bg-neutral-50 hover:shadow-sm"
                        : "hover:bg-neutral-50/50"
                    )}
                    onClick={() => {
                      if (booking.bookingStatus === "Completed") {
                        setSelectedBooking(booking);
                        setShowReviewForm(false);
                        setSubmitError(null);
                      }
                    }}
                  >
                    <td className="p-4 font-medium text-neutral-900">
                      {booking.unitName ?? "Property"}
                    </td>
                    <td className="p-4 text-neutral-600">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="p-4 text-neutral-600">{booking.guestCount}</td>
                    <td className="p-4 font-medium text-neutral-900">
                      {formatCurrency(booking.finalAmount)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={booking.bookingStatus} />
                        {booking.bookingStatus === "Completed" && (
                          <ReviewStatusIndicator bookingId={booking.id} />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-500">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={cn(
                  "rounded-xl border border-neutral-100 bg-white p-4 shadow-card transition-all duration-200",
                  booking.bookingStatus === "Completed"
                    ? "cursor-pointer hover:shadow-md hover:border-neutral-200"
                    : ""
                )}
                onClick={() => {
                  if (booking.bookingStatus === "Completed") {
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
                    <p className="mt-2 text-sm text-neutral-600">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={booking.bookingStatus} />
                    {booking.bookingStatus === "Completed" && (
                      <ReviewStatusIndicator bookingId={booking.id} />
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Guests</p>
                    <p className="font-medium text-neutral-900">{booking.guestCount}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Total</p>
                    <p className="font-medium text-neutral-900">
                      {formatCurrency(booking.finalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-neutral-400" />
                  {selectedBooking.unitName ?? "Property"}
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-1">
                  ID: {selectedBooking.id}
                </p>
              </div>
              <div className="self-start sm:self-center">
                <StatusBadge status={selectedBooking.bookingStatus} />
              </div>
            </div>

            {/* Stay Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Check-In</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {formatDate(selectedBooking.checkInDate)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Check-Out</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {formatDate(selectedBooking.checkOutDate)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  ({getNightsCount(selectedBooking.checkInDate, selectedBooking.checkOutDate)} nights)
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Guests</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {selectedBooking.guestCount} guests
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Total Paid</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {formatCurrency(selectedBooking.finalAmount)}
                </p>
              </div>
            </div>

            {/* Review Section */}
            <div className="border-t border-neutral-100 pt-6">
              {reviewLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-100 border-t-primary-600" />
                  <p className="text-sm text-neutral-500 font-medium">Checking review status...</p>
                </div>
              ) : showReviewForm ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Booking details
                    </button>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                    <ReviewForm
                      mode={existingReview ? "edit" : "create"}
                      existingReview={existingReview}
                      onSubmit={handleReviewSubmit}
                      isSubmitting={isSubmitting}
                      error={submitError}
                    />
                  </div>
                </div>
              ) : existingReview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-neutral-900">Your Review</h4>
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                      existingReview.reviewStatus === "Pending" ? "bg-amber-50 text-amber-800 ring-amber-600/20 animate-pulse" :
                      existingReview.reviewStatus === "Published" ? "bg-green-50 text-green-700 ring-green-600/20" :
                      existingReview.reviewStatus === "Rejected" ? "bg-red-50 text-red-700 ring-red-600/20" :
                      "bg-neutral-50 text-neutral-600 ring-neutral-500/10"
                    )}>
                      {existingReview.reviewStatus}
                    </span>
                  </div>

                  <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm space-y-4">
                    <div className="space-y-2">
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
                      <h5 className="font-semibold text-neutral-900 text-base">{existingReview.title}</h5>
                      {existingReview.comment && (
                        <p className="text-sm text-neutral-600 whitespace-pre-line leading-relaxed">
                          {existingReview.comment}
                        </p>
                      )}
                    </div>

                    {existingReview.reviewStatus === "Pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full transition-all duration-150 hover:bg-neutral-50"
                        onClick={() => setShowReviewForm(true)}
                      >
                        Edit Review
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-xl p-8 bg-neutral-50/20 text-center">
                  <div className="rounded-full bg-amber-50 p-3 ring-8 ring-amber-50/50">
                    <Star className="h-6 w-6 text-amber-400 stroke-[1.5]" />
                  </div>
                  <h4 className="mt-4 font-display font-bold text-neutral-900">Share your experience</h4>
                  <p className="mt-1 text-sm text-neutral-500 max-w-sm">
                    You haven&apos;t reviewed your stay at this property yet. Help other guests by leaving a review!
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-5 px-6 shadow-sm hover:shadow transition-all"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
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
