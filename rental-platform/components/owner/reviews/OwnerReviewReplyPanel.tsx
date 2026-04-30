"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  useUpsertReviewReply,
  useDeleteReviewReply,
  useSetReviewReplyVisibility,
} from "@/lib/hooks/useReviews";
import { queryKeys } from "@/lib/hooks/query-keys";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type {
  PublishedReviewListItemResponse,
  ReviewReplyResponse,
} from "@/lib/types";

const replySchema = z.object({
  replyText: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
  isVisible: z.boolean().optional().default(true),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface OwnerReviewReplyPanelProps {
  reviewId: string;
  unitId: string;
  review: PublishedReviewListItemResponse;
  existingReply?: ReviewReplyResponse | null;
  onClose: () => void;
}

export function OwnerReviewReplyPanel({
  reviewId,
  unitId,
  review,
  existingReply,
  onClose,
}: OwnerReviewReplyPanelProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(!existingReply);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mutations
  const upsertMutation = useUpsertReviewReply();
  const deleteMutation = useDeleteReviewReply();
  const visibilityMutation = useSetReviewReplyVisibility();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      replyText: existingReply?.replyText || "",
      isVisible: existingReply?.isVisible ?? true,
    },
  });

  const replyTextValue = watch("replyText") || "";
  const charCount = replyTextValue.length;
  const maxChars = 1000;

  // Invalidate queries helper
  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.reviews.reply(reviewId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.reviews.publicByUnit(unitId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.reviews.publicSummary(unitId),
    });
  };

  // Submit handler (create or update)
  const onSubmit = (data: ReplyFormData) => {
    upsertMutation.mutate(
      {
        reviewId,
        data: {
          replyText: data.replyText,
          isVisible: data.isVisible ?? true, // API expects isVisible per Section 25
        },
      },
      {
        onSuccess: () => {
          toast.success(existingReply ? "Reply updated" : "Reply posted");
          setIsEditing(false);
          invalidateRelatedQueries();
        },
        onError: () => {
          toast.error("Could not save reply");
        },
      }
    );
  };

  // Delete handler
  const handleDelete = () => {
    deleteMutation.mutate(reviewId, {
      onSuccess: () => {
        toast.success("Reply deleted");
        setShowDeleteConfirm(false);
        reset({ replyText: "", isVisible: true });
        setIsEditing(false);
        invalidateRelatedQueries();
        onClose();
      },
      onError: () => {
        toast.error("Could not delete reply");
      },
    });
  };

  // Visibility toggle handler
  const handleVisibilityToggle = () => {
    if (!existingReply) return;

    visibilityMutation.mutate(
      {
        reviewId,
        data: { isVisible: !existingReply.isVisible },
      },
      {
        onSuccess: () => {
          toast.success(
            existingReply.isVisible
              ? "Reply hidden from public"
              : "Reply visible to public"
          );
          invalidateRelatedQueries();
        },
        onError: () => {
          toast.error("Could not update visibility");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <h2 className="text-lg font-semibold">Reply to Review</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
          >
            <svg
              className="h-5 w-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Original Review (Read-Only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={[
                    "h-4 w-4",
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300",
                  ].join(" ")}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <h3 className="font-semibold text-neutral-800">{review.title}</h3>
            {review.comment && (
              <p className="text-sm text-neutral-600">{review.comment}</p>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* Reply Section */}
          {existingReply && !isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-700">Your Reply</h4>
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      existingReply.isVisible
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-600",
                    ].join(" ")}
                  >
                    {existingReply.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>

              <p className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
                {existingReply.replyText}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    reset({
                      replyText: existingReply.replyText,
                      isVisible: existingReply.isVisible,
                    });
                    setIsEditing(true);
                  }}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Reply
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVisibilityToggle}
                  disabled={visibilityMutation.isPending}
                >
                  {visibilityMutation.isPending ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                  ) : (
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {existingReply.isVisible ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                  )}
                  {existingReply.isVisible ? "Hide Reply" : "Show Reply"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Reply
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {existingReply ? "Edit your reply" : "Write your reply"}
                </label>
                <textarea
                  {...register("replyText")}
                  rows={5}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thank you for your feedback..."
                />
                {errors.replyText && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.replyText.message}
                  </p>
                )}
                <p
                  className={[
                    "mt-1 text-right text-xs",
                    charCount > maxChars ? "text-red-500" : "text-neutral-400",
                  ].join(" ")}
                >
                  {charCount}/{maxChars}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                {existingReply && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={upsertMutation.isPending}
                >
                  {upsertMutation.isPending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : existingReply ? (
                    "Update Reply"
                  ) : (
                    "Post Reply"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Reply"
          description="Are you sure you want to delete your reply? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
