import type { OwnerPortalFinanceSummaryResponse } from "@/lib/types/owner-portal.types";
import { formatCurrency } from "@/lib/utils/format";

interface OwnerFinanceSummaryProps {
  summary: OwnerPortalFinanceSummaryResponse;
}

export function OwnerFinanceSummary({ summary }: OwnerFinanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Invoiced Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Invoiced Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-neutral-900">
          {formatCurrency(summary.totalInvoicedAmount)}
        </p>
      </div>

      {/* Total Paid Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Paid Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-green-600">
          {formatCurrency(summary.totalPaidAmount)}
        </p>
      </div>

      {/* Total Remaining Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Remaining Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-orange-600">
          {formatCurrency(summary.totalRemainingAmount)}
        </p>
      </div>

      {/* Total Pending Payout Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Pending Payout Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-yellow-600">
          {formatCurrency(summary.totalPendingPayoutAmount)}
        </p>
      </div>

      {/* Total Scheduled Payout Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Scheduled Payout Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-blue-600">
          {formatCurrency(summary.totalScheduledPayoutAmount)}
        </p>
      </div>

      {/* Total Paid Payout Amount */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-xs font-medium text-neutral-500">
          Total Paid Payout Amount
        </p>
        <p className="mt-2 text-2xl font-bold text-green-600">
          {formatCurrency(summary.totalPaidPayoutAmount)}
        </p>
      </div>
    </div>
  );
}
