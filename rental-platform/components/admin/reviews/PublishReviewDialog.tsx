"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";

interface PublishReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
}

export function PublishReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: PublishReviewDialogProps) {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes("");
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Publish review"
      onConfirm={handleConfirm}
      isLoading={isLoading}
      confirmLabel="Publish review"
      variant="primary"
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Publish this review? It will become visible on the public unit page.
        </p>
        <Textarea
          label="Internal note (optional)"
          placeholder="Add moderation context"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </ConfirmDialog>
  );
}
