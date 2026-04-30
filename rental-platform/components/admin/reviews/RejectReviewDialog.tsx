"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";

// CORRECTED per API Reference Section 24 / P21:
// onConfirm takes optional notes — NOT a required reason

interface RejectReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
}

export function RejectReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RejectReviewDialogProps) {
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
      title="Reject Review"
      onConfirm={handleConfirm}
      isLoading={isLoading}
      confirmLabel="Reject"
      variant="danger"
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          This review will be marked as rejected and will not appear publicly.
        </p>
        <Textarea
          label="Notes (optional)"
          placeholder="Reason for rejection..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </ConfirmDialog>
  );
}
