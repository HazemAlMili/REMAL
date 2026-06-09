"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants/payment-statuses";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/payment-methods";
import type { PaymentResponse } from "@/lib/types/booking.types";
import type { PaginationMeta } from "@/lib/api/types";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

interface PaymentsTableProps {
  payments: PaymentResponse[];
  isLoading: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onMarkPaid: (payment: PaymentResponse) => void;
  onMarkFailed: (id: string) => void;
  onCancel: (id: string) => void;
}

export function PaymentsTable({
  payments,
  isLoading,
  pagination,
  onPageChange,
  onMarkPaid,
  onMarkFailed,
  onCancel,
}: PaymentsTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={10} columns={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-start text-neutral-600">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Booking
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Invoice
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Amount
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Method
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Reference
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Paid at
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Created
              </th>
              <th className="px-3 py-2 text-end text-xs font-semibold uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="transition-colors hover:bg-neutral-50"
              >
                <td className="h-[var(--portal-row-height)] px-3 py-2">
                  <Link
                    href={ROUTES.admin.bookings.detail(payment.bookingId)}
                    className="font-mono text-info hover:underline"
                  >
                    {payment.bookingId.slice(0, 8)}...
                  </Link>
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 font-mono text-neutral-500">
                  {payment.invoiceId
                    ? payment.invoiceId.slice(0, 8) + "..."
                    : "-"}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 font-medium">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2">
                  {PAYMENT_METHOD_LABELS[
                    payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                  ] ?? payment.paymentMethod}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 font-mono text-neutral-500">
                  {payment.referenceNumber ?? "-"}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2">
                  <StatusBadge
                    status={payment.paymentStatus}
                    colorMap={PAYMENT_STATUS_COLORS}
                    labelMap={PAYMENT_STATUS_LABELS}
                  />
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 text-neutral-500">
                  {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 text-neutral-500">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 text-end">
                  {payment.paymentStatus?.trim().toLowerCase() ===
                    "pending" && (
                    <PaymentActions
                      payment={payment}
                      onMarkPaid={onMarkPaid}
                      onMarkFailed={onMarkFailed}
                      onCancel={onCancel}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={pagination} onPageChange={onPageChange} />
    </div>
  );
}

function PaymentActions({
  payment,
  onMarkPaid,
  onMarkFailed,
  onCancel,
}: {
  payment: PaymentResponse;
  onMarkPaid: (payment: PaymentResponse) => void;
  onMarkFailed: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" onClick={() => onMarkPaid(payment)}>
        Mark paid
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => onMarkFailed(payment.id)}
      >
        Mark failed
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onCancel(payment.id)}>
        Cancel
      </Button>
    </div>
  );
}
