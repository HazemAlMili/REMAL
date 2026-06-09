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
      <div className="w-full max-w-md rounded-lg bg-white p-7 shadow-xl">
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
              out of sync with the booking payment state:{" "}
              {reason.toLowerCase()}.
            </p>
          </div>
        </div>

        <p className="mb-2 text-sm font-medium text-neutral-700">
          How do you want to sync it?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onReissue}
            disabled={isLoading}
            className="w-full rounded-[var(--portal-radius-control)] border border-neutral-200 p-3 text-left transition-colors hover:border-primary-400 hover:bg-primary-50/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-neutral-900">
                {isLoading ? "Re-issuing…" : "Re-issue invoice"}
              </span>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                Recommended
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              Keeps recorded payments and generates a new invoice number.
            </span>
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            disabled={isLoading}
            className="w-full rounded-[var(--portal-radius-control)] border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-sm font-semibold text-neutral-900">
              Cancel and create replacement
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              Closes this invoice and starts a fresh one without its payments.
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
          <Button variant="ghost" size="sm" onClick={onSkip} disabled={isLoading}>
            Decide later
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Keep invoice unchanged
          </Button>
        </div>
      </div>
    </div>
  );
}
