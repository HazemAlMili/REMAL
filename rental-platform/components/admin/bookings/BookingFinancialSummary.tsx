
"use client";

import { formatCurrency } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { INVOICE_STATUS_LABELS } from "@/lib/constants/invoice-statuses";
import { PAYOUT_STATUS_LABELS } from "@/lib/constants/payout-statuses";
import type { BookingFinanceSnapshotResponse } from "@/lib/types/booking.types";

interface BookingFinancialSummaryProps {
  snapshot: BookingFinanceSnapshotResponse;
}

export function BookingFinancialSummary({ snapshot }: BookingFinancialSummaryProps) {
  const hasOutstanding = snapshot.remainingAmount > 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">Financial Summary</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Invoiced Amount */}
        <div>
          <p className="text-xs text-neutral-500">Invoiced Amount</p>
          <p className="text-sm font-semibold text-neutral-800">
            {formatCurrency(snapshot.invoicedAmount)}
          </p>
        </div>

        {/* Paid Amount */}
        <div>
          <p className="text-xs text-neutral-500">Paid Amount</p>
          <p className="text-sm font-semibold text-neutral-800">
            {formatCurrency(snapshot.paidAmount)}
          </p>
        </div>

        {/* Remaining Amount */}
        <div>
          <p className="text-xs text-neutral-500">Remaining Amount</p>
          <p className={`text-sm font-semibold ${hasOutstanding ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(snapshot.remainingAmount)}
          </p>
          {hasOutstanding && (
            <p className="text-xs text-red-500 mt-0.5">Outstanding balance</p>
          )}
        </div>

        {/* Invoice Status */}
        <div>
          <p className="text-xs text-neutral-500">Invoice Status</p>
          {snapshot.invoiceStatus ? (
            <StatusBadge status={snapshot.invoiceStatus} label={INVOICE_STATUS_LABELS[snapshot.invoiceStatus]} />
          ) : (
            <span className="text-xs text-neutral-400 italic">No invoice</span>
          )}
        </div>

        {/* Owner Payout Status */}
        <div className="col-span-2">
          <p className="text-xs text-neutral-500">Owner Payout Status</p>
          {snapshot.ownerPayoutStatus ? (
            <StatusBadge status={snapshot.ownerPayoutStatus} label={PAYOUT_STATUS_LABELS[snapshot.ownerPayoutStatus]} />
          ) : (
            <span className="text-xs text-neutral-400 italic">No payout created</span>
          )}
        </div>
      </div>

      {/* Quick status indicator */}
      {hasOutstanding && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">
          ⚠️ This booking has an outstanding balance of {formatCurrency(snapshot.remainingAmount)}
        </div>
      )}

      {!hasOutstanding && snapshot.paidAmount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-2 text-xs text-green-700">
          ✓ Fully paid — no outstanding balance
        </div>
      )}
    </div>
  );
}

