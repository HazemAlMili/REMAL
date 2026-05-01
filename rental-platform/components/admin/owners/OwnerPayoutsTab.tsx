"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils/format";
import {
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
} from "@/lib/constants/payout-statuses";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordPayoutModal } from "@/components/admin/finance/RecordPayoutModal";
import { SchedulePayoutDialog } from "@/components/admin/finance/SchedulePayoutDialog";
import { MarkPayoutPaidDialog } from "@/components/admin/finance/MarkPayoutPaidDialog";
import { CancelPayoutDialog } from "@/components/admin/finance/CancelPayoutDialog";
import { useOwnerPayouts, useOwnerPayoutSummary } from "@/lib/hooks/usePayouts";
import { usePermissions } from "@/lib/hooks";
import type { OwnerPayoutResponse } from "@/lib/types/finance.types";

interface OwnerPayoutsTabProps {
  ownerId: string;
}

export function OwnerPayoutsTab({ ownerId }: OwnerPayoutsTabProps) {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [scheduledPayoutId, setScheduledPayoutId] = useState<string | null>(
    null
  );
  const [markPaidPayoutId, setMarkPaidPayoutId] = useState<string | null>(null);
  const [cancelPayoutId, setCancelPayoutId] = useState<string | null>(null);

  const { data: payouts, isLoading: payoutsLoading } = useOwnerPayouts(ownerId);
  const { data: summary, isLoading: summaryLoading } =
    useOwnerPayoutSummary(ownerId);
  const { canManageFinance } = usePermissions();

  const handleSchedule = (id: string) => setScheduledPayoutId(id);
  const handleMarkPaid = (id: string) => setMarkPaidPayoutId(id);
  const handleCancel = (id: string) => setCancelPayoutId(id);

  const handleCloseDialogs = () => {
    setScheduledPayoutId(null);
    setMarkPaidPayoutId(null);
    setCancelPayoutId(null);
  };

  if (payoutsLoading) {
    return <SkeletonTable rows={5} columns={7} />;
  }

  if (!payouts?.length) {
    return (
      <div className="space-y-4">
        {summaryLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Owner Payouts
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Track and manage payout history for this owner.
              </p>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-500">
                  Total Pending
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatCurrency(summary?.totalPending ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-500">
                  Total Scheduled
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatCurrency(summary?.totalScheduled ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm font-medium text-neutral-500">
                  Total Paid
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatCurrency(summary?.totalPaid ?? 0)}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <EmptyState
                title="No payouts yet"
                description="Create a payout record when a booking is completed."
                action={
                  canManageFinance && (
                    <Button onClick={() => setIsRecordModalOpen(true)}>
                      New Payout
                    </Button>
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Financial Summary
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-500">
              Total Pending
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.totalPending ?? 0)}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-500">
              Total Scheduled
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.totalScheduled ?? 0)}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-500">Total Paid</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatCurrency(summary?.totalPaid ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {canManageFinance && (
        <div className="flex justify-end">
          <Button onClick={() => setIsRecordModalOpen(true)}>New Payout</Button>
        </div>
      )}

      {/* Payouts Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Booking
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Gross Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Commission
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Payout Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Scheduled
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Paid At
              </th>
              {canManageFinance && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-neutral-600">
                  {payout.bookingId.slice(0, 8)}…
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(payout.grossBookingAmount)}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {Math.round(payout.commissionRate)}% (
                  {formatCurrency(payout.commissionAmount)})
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {formatCurrency(payout.payoutAmount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={payout.payoutStatus}
                    colorMap={PAYOUT_STATUS_COLORS}
                    labelMap={PAYOUT_STATUS_LABELS}
                  />
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {payout.scheduledAt ? payout.scheduledAt : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {payout.paidAt ? payout.paidAt : "—"}
                </td>
                {canManageFinance && (
                  <td className="px-4 py-3">
                    <PayoutActions
                      payout={payout}
                      onSchedule={() => handleSchedule(payout.id)}
                      onMarkPaid={() => handleMarkPaid(payout.id)}
                      onCancel={() => handleCancel(payout.id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals and Dialogs */}
      <RecordPayoutModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        ownerId={ownerId}
      />

      <SchedulePayoutDialog
        isOpen={!!scheduledPayoutId}
        onClose={handleCloseDialogs}
        payoutId={scheduledPayoutId ?? ""}
        ownerId={ownerId}
      />

      <MarkPayoutPaidDialog
        isOpen={!!markPaidPayoutId}
        onClose={handleCloseDialogs}
        payoutId={markPaidPayoutId ?? ""}
        ownerId={ownerId}
      />

      <CancelPayoutDialog
        isOpen={!!cancelPayoutId}
        onClose={handleCloseDialogs}
        payoutId={cancelPayoutId ?? ""}
        ownerId={ownerId}
      />
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
  onSchedule: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
}) {
  switch (payout.payoutStatus) {
    case "Pending":
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onSchedule}>
            Schedule
          </Button>
          <Button size="sm" variant="primary" onClick={onMarkPaid}>
            Mark Paid
          </Button>
          <Button size="sm" variant="danger" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      );
    case "Scheduled":
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={onMarkPaid}>
            Mark Paid
          </Button>
          <Button size="sm" variant="danger" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      );
    case "Paid":
      return <span className="text-xs text-neutral-400">Completed</span>;
    case "Cancelled":
      return <span className="text-xs text-neutral-400">—</span>;
    default:
      return null;
  }
}
