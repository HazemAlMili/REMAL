"use client";

import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

interface InvoiceActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReissue: () => void;
  onCreateNew: () => void;
  onSkip: () => void;
  invoiceNumber: string;
  reason: string;
  isLoading?: boolean;
}

export function InvoiceActionDialog({
  isOpen,
  onClose,
  onReissue,
  onCreateNew,
  onSkip,
  invoiceNumber,
  reason,
  isLoading = false,
}: InvoiceActionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">
              Invoice needs attention
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Invoice <span className="font-medium">{invoiceNumber}</span> is
              out of sync with the booking payment state.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-md bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            <strong>Why this matters:</strong> {reason}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">
            Choose how to sync this invoice.
          </p>

          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full justify-start"
              onClick={onReissue}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Re-issue invoice
              <span className="ml-auto text-xs opacity-75">
                Keep payments, generate a new number
              </span>
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={onCreateNew}
              disabled={isLoading}
            >
              Cancel and create replacement
              <span className="ml-auto text-xs opacity-75">
                Close this invoice, start fresh
              </span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onSkip}
              disabled={isLoading}
            >
              Handle later
              <span className="ml-auto text-xs opacity-75">Handle later</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            Keep invoice unchanged
          </Button>
        </div>
      </div>
    </div>
  );
}
