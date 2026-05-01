// ═══════════════════════════════════════════════════════════
// app/account/bookings/[bookingId]/review/page.tsx
// Review submission page — create + edit modes
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useBookingReview } from "@/lib/hooks/useClient";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { ReviewForm } from "@/components/public/account/ReviewForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toastSuccess } from "@/lib/utils/toast";
import type { ReviewFormData } from "@/lib/validations/review";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/utils/query-keys";

export default function ReviewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { subjectType } = useAuthStore();
  const queryClient = useQueryClient();

  // Auth guard — must be logged in as client
  useEffect(() => {
    if (subjectType !== "Client") {
      router.replace("/client/login");
    }
  }, [subjectType, router]);

  // Check for existing review
  const { data: existingReview, isLoading: reviewLoading } =
    useBookingReview(bookingId);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mode = existingReview ? "edit" : "create";

  // Submit handler — routes to create or update API
  const handleSubmit = async (data: ReviewFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // POST /api/reviews — Create new review
        await api.post(endpoints.clientReviews.create, {
          bookingId: bookingId, // Required in create
          rating: data.rating,
          title: data.title, // Required
          comment: data.comment || undefined,
        });
      } else if (mode === "edit" && existingReview) {
        // PUT /api/reviews/{reviewId} — Update existing review
        await api.put(endpoints.clientReviews.update(existingReview.id), {
          rating: data.rating,
          title: data.title, // Required in update too
          comment: data.comment || "",
        });
      }

      // Invalidate the review query so booking history page updates
      queryClient.invalidateQueries({
        queryKey: queryKeys.clientReviews.byBooking(bookingId),
      });

      toastSuccess(mode === "create" ? "Review submitted!" : "Review updated!");
      router.push("/account/bookings");
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

  // Loading state
  if (reviewLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // If review is Published/Rejected/Hidden, the form shows read-only view
  const isReadOnly =
    existingReview && existingReview.reviewStatus !== "Pending";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Link */}
      <Link
        href="/account/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          {isReadOnly
            ? "Your Review"
            : mode === "create"
              ? "Write a Review"
              : "Edit Your Review"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isReadOnly
            ? `Status: ${existingReview?.reviewStatus}`
            : "Share your experience to help other travelers"}
        </p>
      </div>

      {/* Booking Summary */}
      <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
        <p>
          Booking reference:{" "}
          <span className="font-mono">
            {bookingId.slice(0, 8).toUpperCase()}
          </span>
        </p>
      </div>

      {/* Review Status Notice (edit mode only) */}
      {mode === "edit" && existingReview?.reviewStatus === "Pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Your review is pending moderation. You can still make changes before
          it&apos;s published.
        </div>
      )}

      {/* Review Form */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-card">
        <ReviewForm
          mode={mode}
          existingReview={existingReview}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </div>
    </div>
  );
}
