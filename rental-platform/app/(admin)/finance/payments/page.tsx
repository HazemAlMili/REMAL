"use client";

import { useState } from "react";
import { PaymentsTable } from "@/components/admin/finance/PaymentsTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  usePaymentsList,
  useMarkPaymentPaid,
  useMarkPaymentFailed,
  useCancelPayment,
} from "@/lib/hooks/usePayments";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toast } from "react-hot-toast";
import type { PaymentResponse } from "@/lib/types/booking.types";
import type { PaymentListFilters } from "@/lib/types/finance.types";

export default function PaymentsListPage() {
  const { canViewFinance } = usePermissions();

  const [filters, setFilters] = useState<PaymentListFilters>({
    page: 1,
    pageSize: 20,
  });

  const [markFailedDialog, setMarkFailedDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
  }>({
    isOpen: false,
    paymentId: "",
  });
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
  }>({
    isOpen: false,
    paymentId: "",
  });
  const [dialogNotes, setDialogNotes] = useState("");
  const [markPaidDialog, setMarkPaidDialog] = useState<{
    isOpen: boolean;
    payment: PaymentResponse | null;
  }>({ isOpen: false, payment: null });
  const [paidReferenceNumber, setPaidReferenceNumber] = useState("");
  const [paidNotes, setPaidNotes] = useState("");

  const { data, isLoading } = usePaymentsList(filters);

  const markPaidMutation = useMarkPaymentPaid();
  const markFailedMutation = useMarkPaymentFailed();
  const cancelMutation = useCancelPayment();

  const openMarkPaidDialog = (payment: PaymentResponse) => {
    setMarkPaidDialog({ isOpen: true, payment });
    setPaidReferenceNumber(payment.referenceNumber ?? "");
    setPaidNotes(payment.notes ?? "");
  };

  const closeMarkPaidDialog = () => {
    setMarkPaidDialog({ isOpen: false, payment: null });
    setPaidReferenceNumber("");
    setPaidNotes("");
  };

  const handleMarkPaid = () => {
    const payment = markPaidDialog.payment;
    if (!payment) return;

    markPaidMutation.mutate(
      {
        id: payment.id,
        data: {
          referenceNumber: paidReferenceNumber || undefined,
          notes: paidNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          closeMarkPaidDialog();
          toast.success("Payment marked as paid");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Could not mark payment as paid");
        },
      }
    );
  };

  const handleOpenMarkPaid = (payment: PaymentResponse) => {
    openMarkPaidDialog(payment);
  };

  const handleMarkFailed = () => {
    markFailedMutation.mutate(
      {
        id: markFailedDialog.paymentId,
        data: { notes: dialogNotes || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Payment marked as failed");
          setMarkFailedDialog({ isOpen: false, paymentId: "" });
          setDialogNotes("");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(
            err.response?.data?.message || "Could not mark payment as failed"
          );
        },
      }
    );
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: cancelDialog.paymentId, data: { notes: dialogNotes || undefined } },
      {
        onSuccess: () => {
          toast.success("Payment cancelled");
          setCancelDialog({ isOpen: false, paymentId: "" });
          setDialogNotes("");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(
            err.response?.data?.message || "Could not cancel payment"
          );
        },
      }
    );
  };

  if (!canViewFinance) {
    return (
      <EmptyState
        title="Finance access required"
        description="Your role cannot view payment records. Ask a super admin if you need this access."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments ledger</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Verify receipts, close paid payments, and flag failed or cancelled
            records.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-4">
        <Select
          label="Status"
          options={[
            { value: "", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "failed", label: "Failed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          value={filters.paymentStatus ?? ""}
          onChange={(value) =>
            setFilters({
              ...filters,
              paymentStatus: value as string as
                | "pending"
                | "paid"
                | "failed"
                | "cancelled",
              page: 1,
            })
          }
        />
        <Input
          label="Booking ID"
          placeholder="Paste a booking ID"
          value={filters.bookingId ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              bookingId: e.target.value || undefined,
              page: 1,
            })
          }
        />
        <Input
          label="Invoice ID"
          placeholder="Paste an invoice ID"
          value={filters.invoiceId ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              invoiceId: e.target.value || undefined,
              page: 1,
            })
          }
        />
      </div>

      {/* Payments table */}
      {data?.items.length === 0 ? (
        <EmptyState
          title="No matching payments"
          description="No payment records match these filters. Clear a filter or search another booking."
        />
      ) : (
        <PaymentsTable
          payments={data?.items ?? []}
          isLoading={isLoading}
          pagination={
            data?.pagination ?? {
              totalCount: 0,
              page: 1,
              pageSize: 20,
              totalPages: 0,
            }
          }
          onPageChange={(page) => setFilters({ ...filters, page })}
          onMarkPaid={handleOpenMarkPaid}
          onMarkFailed={(id) =>
            setMarkFailedDialog({ isOpen: true, paymentId: id })
          }
          onCancel={(id) => setCancelDialog({ isOpen: true, paymentId: id })}
        />
      )}

      {/* Mark Paid Dialog */}
      <ConfirmDialog
        isOpen={markPaidDialog.isOpen}
        onClose={closeMarkPaidDialog}
        title="Mark payment as paid"
        onConfirm={handleMarkPaid}
        isLoading={markPaidMutation.isPending}
        confirmLabel="Mark payment paid"
        variant="primary"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-neutral-600">
            Add the verified receipt reference before closing this payment.
          </p>
          <Input
            label="Receipt reference"
            placeholder="INSTAPAY-202608-001"
            value={paidReferenceNumber}
            onChange={(e) => setPaidReferenceNumber(e.target.value)}
          />
          <Textarea
            label="Internal note (optional)"
            placeholder="Add payment verification context"
            value={paidNotes}
            onChange={(e) => setPaidNotes(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      {/* Mark Failed Dialog */}
      <ConfirmDialog
        isOpen={markFailedDialog.isOpen}
        onClose={() => {
          setMarkFailedDialog({ isOpen: false, paymentId: "" });
          setDialogNotes("");
        }}
        title="Mark payment as failed"
        onConfirm={handleMarkFailed}
        isLoading={markFailedMutation.isPending}
        confirmLabel="Mark payment failed"
        variant="danger"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-neutral-600">
            Mark this payment as failed? The invoice balance will stay open.
          </p>
          <Textarea
            label="Internal note (optional)"
            placeholder="Add the failure reason"
            value={dialogNotes}
            onChange={(e) => setDialogNotes(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => {
          setCancelDialog({ isOpen: false, paymentId: "" });
          setDialogNotes("");
        }}
        title="Cancel payment"
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
        confirmLabel="Cancel payment"
        variant="danger"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-neutral-600">
            Cancel this payment? This cannot be undone, and it will no longer
            count toward the booking balance.
          </p>
          <Textarea
            label="Internal note (optional)"
            placeholder="Add the cancellation reason"
            value={dialogNotes}
            onChange={(e) => setDialogNotes(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
