import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import type { PublishedReviewListItemResponse } from "@/lib/types/review.types";

interface OwnerReviewCardProps {
  review: PublishedReviewListItemResponse;
  onReplyClick: (reviewId: string) => void;
}

export function OwnerReviewCard({
  review,
  onReplyClick,
}: OwnerReviewCardProps) {
  const hasReply = review.ownerReplyText !== null;

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
      {/* Header: Stars + Date + Reply Badge */}
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          {hasReply && (
            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              Replied
            </span>
          )}
          <span className="text-xs text-neutral-400">
            {formatDistanceToNow(new Date(review.publishedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-neutral-800">{review.title}</h4>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm leading-relaxed text-neutral-600">
          {review.comment}
        </p>
      )}

      {/* Owner Reply Preview */}
      {hasReply && (
        <div className="rounded-r-lg border-l-2 border-blue-400 bg-blue-50 p-3">
          <p className="mb-1 text-xs font-medium text-blue-700">Your Reply</p>
          <p className="text-sm text-blue-900">{review.ownerReplyText}</p>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReplyClick(review.reviewId)}
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {hasReply ? "View / Edit Reply" : "Reply"}
        </Button>
      </div>
    </div>
  );
}
