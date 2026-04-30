"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";

// CORRECTED per API Reference Section 24 / P21:
// onConfirm takes optional notes — NOT a required reason

interface HideReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
}

export function HideReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: HideReviewDialogProps) {
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
      title="Hide Review"
      onConfirm={handleConfirm}
      isLoading={isLoading}
      confirmLabel="Hide"
      variant="danger"
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          This review will be hidden from public view. It can be republished
          later.
        </p>
        <Textarea
          label="Notes (optional)"
          placeholder="Reason for hiding..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </ConfirmDialog>
  );
}
