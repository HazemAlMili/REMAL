"use client";

import { Button } from "@/components/ui/Button";
import type { ReviewStatus } from "@/lib/types/review.types";

interface ModerationActionsProps {
  reviewId: string;
  currentStatus: ReviewStatus;
  onPublish: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onHide: (reviewId: string) => void;
  canModerate: boolean;
}

export function ModerationActions({
  reviewId,
  currentStatus,
  onPublish,
  onReject,
  onHide,
  canModerate,
}: ModerationActionsProps) {
  if (!canModerate) return null;

  switch (currentStatus) {
    case "Pending":
      return (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onPublish(reviewId)}
          >
            Publish
          </Button>
          <Button size="sm" variant="danger" onClick={() => onReject(reviewId)}>
            Reject
          </Button>
        </div>
      );
    case "Published":
      return (
        <Button size="sm" variant="ghost" onClick={() => onHide(reviewId)}>
          Hide
        </Button>
      );
    case "Rejected":
    case "Hidden":
      return (
        <Button size="sm" variant="primary" onClick={() => onPublish(reviewId)}>
          Publish
        </Button>
      );
    default:
      return null;
  }
}
