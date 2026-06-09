"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CRM_STATUS_LABELS } from "@/lib/constants/booking-statuses";
import type { CrmLeadStatus } from "@/lib/types/crm.types";

interface StatusTransitionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  targetStatus: CrmLeadStatus | null;
  isLoading: boolean;
}

export function StatusTransitionDialog({
  isOpen,
  onClose,
  onConfirm,
  targetStatus,
  isLoading,
}: StatusTransitionDialogProps) {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes || undefined);
    setNotes("");
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  if (!targetStatus) return null;

  const isDestructive =
    targetStatus === "Lost";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Move lead stage"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">
          Move this lead to{" "}
          <span className="font-semibold text-neutral-900">
            {CRM_STATUS_LABELS[targetStatus]}
          </span>
          ?
        </p>

        {isDestructive && (
          <p className="text-danger text-xs font-medium">
            Moving this lead to {CRM_STATUS_LABELS[targetStatus]} will release
            any holds on the requested unit dates.
          </p>
        )}

        {targetStatus === "Converted" && (
          <p className="text-xs font-medium text-accent-blue">
            Moving this lead to Converted will create a hold on the requested
            unit dates.
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context for this stage change"
            className="h-20 w-full resize-none rounded-md border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Move lead
          </Button>
        </div>
      </div>
    </Modal>
  );
}
