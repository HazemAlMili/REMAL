"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
} from "@/lib/constants/payout-statuses";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import type { OwnerPayoutResponse } from "@/lib/types/finance.types";

interface PayoutsTableProps {
  payouts: OwnerPayoutResponse[];
  isLoading: boolean;
  onSchedule: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
}

export function PayoutsTable({
  payouts,
  isLoading,
  onSchedule,
  onMarkPaid,
  onCancel,
}: PayoutsTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={5} columns={7} />;
  }

  if (!payouts.length) {
    return null; // EmptyState will be rendered in the parent component
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-500">
          <tr>
            <th className="p-3 font-medium">Booking</th>
            <th className="p-3 font-medium">Gross Amount</th>
            <th className="p-3 font-medium">Commission</th>
            <th className="p-3 font-medium">Payout Amount</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Scheduled</th>
            <th className="p-3 font-medium">Paid At</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {payouts.map((payout) => (
            <tr key={payout.id} className="hover:bg-neutral-50">
              <td className="p-3 font-mono text-neutral-600">
                {payout.bookingId.slice(0, 8)}â€¦
              </td>
              <td className="p-3">
                {formatCurrency(payout.grossBookingAmount)}
              </td>
              <td className="p-3 text-neutral-600">
                {Math.round(payout.commissionRate)}% (
                {formatCurrency(payout.commissionAmount)})
              </td>
              <td className="p-3 font-medium text-neutral-900">
                {formatCurrency(payout.payoutAmount)}
              </td>
              <td className="p-3">
                <StatusBadge
                  status={payout.payoutStatus}
                  colorMap={PAYOUT_STATUS_COLORS}
                  labelMap={PAYOUT_STATUS_LABELS}
                />
              </td>
              <td className="p-3 text-neutral-500">
                {payout.scheduledAt ? formatDate(payout.scheduledAt) : "â€”"}
              </td>
              <td className="p-3 text-neutral-500">
                {payout.paidAt ? formatDate(payout.paidAt) : "â€”"}
              </td>
              <td className="p-3">
                <PayoutActions
                  payout={payout}
                  onSchedule={onSchedule}
                  onMarkPaid={onMarkPaid}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutActions({
  payout,
  onSchedule,
  onMarkPaid,
  onCancel,
}: {
  payout: OwnerPayoutResponse;
  onSchedule: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  switch (payout.payoutStatus) {
    case "Pending":
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSchedule(payout.id)}
          >
            Schedule
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onMarkPaid(payout.id)}
          >
            Mark Paid
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onCancel(payout.id)}
          >
            Cancel
          </Button>
        </div>
      );
    case "Scheduled":
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onMarkPaid(payout.id)}
          >
            Mark Paid
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onCancel(payout.id)}
          >
            Cancel
          </Button>
        </div>
      );
    case "Paid":
      return <span className="text-xs text-neutral-400">Completed</span>;
    case "Cancelled":
      return <span className="text-xs text-neutral-400">â€”</span>;
    default:
      return null;
  }
}
