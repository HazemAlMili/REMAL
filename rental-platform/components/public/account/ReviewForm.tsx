// ═══════════════════════════════════════════════════════════
// components/public/account/ReviewForm.tsx
// Review form — create + edit modes
// ═══════════════════════════════════════════════════════════

"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewFormData } from "@/lib/validations/review";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StarRatingInput } from "./StarRatingInput";
import { Star } from "lucide-react";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";

interface ReviewFormProps {
  mode: "create" | "edit";
  existingReview?: ClientReviewByBookingResponse | null;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function ReviewForm({
  mode,
  existingReview,
  onSubmit,
  isSubmitting,
  error,
}: ReviewFormProps) {
  const isReadOnly =
    existingReview && existingReview.reviewStatus !== "Pending";

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      title: existingReview?.title || "",
      comment: existingReview?.comment || "",
    },
  });

  // If the review is Published/Rejected/Hidden, show read-only view
  if (isReadOnly) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          This review has been {existingReview.reviewStatus.toLowerCase()} and
          can no longer be edited.
        </div>

        {/* Read-only display */}
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium text-neutral-500">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    (existingReview?.rating || 0) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-neutral-500">Title</p>
            <p className="text-neutral-900">{existingReview?.title}</p>
          </div>

          {existingReview?.comment && (
            <div>
              <p className="mb-1 text-sm font-medium text-neutral-500">
                Comment
              </p>
              <p className="whitespace-pre-line text-neutral-700">
                {existingReview.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Star Rating — Controller for controlled component */}
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <StarRatingInput
            value={field.value}
            onChange={field.onChange}
            error={errors.rating?.message}
            disabled={isSubmitting}
          />
        )}
      />

      {/* Title — REQUIRED */}
      <Input
        label="Title"
        placeholder="Summarize your experience"
        error={errors.title?.message}
        required
        maxLength={200}
        disabled={isSubmitting}
        {...register("title")}
      />

      {/* Comment — Optional */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Comment <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          placeholder="Share details about your stay..."
          rows={4}
          maxLength={2000}
          disabled={isSubmitting}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm
            transition-colors duration-150
            placeholder:text-neutral-400
            focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500
            disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400
            ${errors.comment ? "border-error focus:ring-error" : "border-neutral-300"}
          `}
          {...register("comment")}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-error">{errors.comment.message}</p>
        )}
      </div>

      {/* API Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {mode === "create" ? "Submit Review" : "Update Review"}
      </Button>
    </form>
  );
}
