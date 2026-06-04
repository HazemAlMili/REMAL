"use client";

import { StarRating } from "@/components/public/cards/StarRating";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { PublishedReviewListItem } from "@/lib/types/public.types";

interface PublicReviewCardProps {
  review: PublishedReviewListItem;
}

export function PublicReviewCard({ review }: PublicReviewCardProps) {
  return (
    <div className="border-b border-neutral-100 pb-6 last:border-0">
      {/* Review Header (Stars & Title) */}
      <div className="mb-2 flex items-center gap-3">
        <StarRating rating={review.rating} size={14} />
        <h4 className="font-semibold text-neutral-900 leading-tight">
          <bdi>{review.title}</bdi>
        </h4>
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="mb-2 text-sm leading-relaxed text-neutral-600 break-words whitespace-pre-line">
          <bdi>{review.comment}</bdi>
        </p>
      )}

      {/* Review Meta Info */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="font-semibold text-neutral-700">
          <bdi>{review.clientDisplayName || "عميل المنصة"}</bdi>
        </span>
        <span>·</span>
        <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/10">
          Verified Guest
        </span>
        <span>·</span>
        <span>
          <bdi>{formatDate(review.publishedAt)}</bdi>
        </span>
      </div>

      {/* Owner Reply Block */}
      {review.ownerReplyText && review.ownerReplyText.trim() && (
        <div 
          className="mt-3 mr-6 p-3 bg-neutral-50/70 border-r-2 border-primary-light rounded-l-md break-words" 
          dir="rtl"
        >
          <div className="flex justify-between items-center mb-1 gap-2">
            <span className="text-xs font-bold text-primary-dark">
              <bdi>{review.ownerName ? `رد المالك (${review.ownerName})` : "رد المالك"}</bdi>
            </span>
            <span className="text-[10px] text-neutral-400 shrink-0">
              <bdi>{formatRelativeTime(review.ownerReplyAt)}</bdi>
            </span>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
            <bdi>{review.ownerReplyText}</bdi>
          </p>
        </div>
      )}
    </div>
  );
}
