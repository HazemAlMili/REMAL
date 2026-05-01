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
  onMarkPaid: (id: string) => void;
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
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="p-4 font-medium">Booking</th>
              <th className="p-4 font-medium">Invoice</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Method</th>
              <th className="p-4 font-medium">Reference</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Paid At</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-neutral-50">
                <td className="p-4">
                  <Link
                    href={ROUTES.admin.bookings.detail(payment.bookingId)}
                    className="font-mono text-blue-600 hover:underline"
                  >
                    {payment.bookingId.slice(0, 8)}â€¦
                  </Link>
                </td>
                <td className="p-4 font-mono text-neutral-500">
                  {payment.invoiceId
                    ? payment.invoiceId.slice(0, 8) + "â€¦"
                    : "â€”"}
                </td>
                <td className="p-4 font-medium">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="p-4">
                  {PAYMENT_METHOD_LABELS[
                    payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                  ] ?? payment.paymentMethod}
                </td>
                <td className="p-4 font-mono text-neutral-500">
                  {payment.referenceNumber ?? "â€”"}
                </td>
                <td className="p-4">
                  <StatusBadge
                    status={payment.paymentStatus}
                    colorMap={PAYMENT_STATUS_COLORS}
                    labelMap={PAYMENT_STATUS_LABELS}
                  />
                </td>
                <td className="p-4 text-neutral-500">
                  {payment.paidAt ? formatDate(payment.paidAt) : "â€”"}
                </td>
                <td className="p-4 text-neutral-500">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="p-4 text-right">
                  {payment.paymentStatus === "Pending" && (
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
  onMarkPaid: (id: string) => void;
  onMarkFailed: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" onClick={() => onMarkPaid(payment.id)}>
        Mark Paid
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => onMarkFailed(payment.id)}
      >
        Mark Failed
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onCancel(payment.id)}>
        Cancel
      </Button>
    </div>
  );
}
