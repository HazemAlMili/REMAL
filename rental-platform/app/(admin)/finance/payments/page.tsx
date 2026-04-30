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

  const { data, isLoading } = usePaymentsList(filters);

  const markPaidMutation = useMarkPaymentPaid();
  const markFailedMutation = useMarkPaymentFailed();
  const cancelMutation = useCancelPayment();

  const handleMarkPaid = (paymentId: string) => {
    markPaidMutation.mutate(paymentId, {
      onSuccess: () => {
        toast.success("Payment marked as paid");
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to mark as paid");
      },
    });
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
            err.response?.data?.message || "Failed to mark as failed"
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
            err.response?.data?.message || "Failed to cancel payment"
          );
        },
      }
    );
  };

  if (!canViewFinance) {
    return (
      <EmptyState
        title="Access Denied"
        description="You do not have permission to view this page."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">All Payments</h1>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-4">
        <Select
          label="Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "Pending", label: "Pending" },
            { value: "Paid", label: "Paid" },
            { value: "Failed", label: "Failed" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
          value={filters.paymentStatus ?? ""}
          onChange={(value) =>
            setFilters({
              ...filters,
              paymentStatus: value as string as
                | "Pending"
                | "Paid"
                | "Failed"
                | "Cancelled",
              page: 1,
            })
          }
        />
        <Input
          label="Booking ID"
          placeholder="Filter by booking..."
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
          placeholder="Filter by invoice..."
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
          title="No payments found"
          description="Try adjusting your filters to find what you're looking for."
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
          onMarkPaid={handleMarkPaid}
          onMarkFailed={(id) =>
            setMarkFailedDialog({ isOpen: true, paymentId: id })
          }
          onCancel={(id) => setCancelDialog({ isOpen: true, paymentId: id })}
        />
      )}

      {/* Mark Failed Dialog */}
      <ConfirmDialog
        isOpen={markFailedDialog.isOpen}
        onClose={() => {
          setMarkFailedDialog({ isOpen: false, paymentId: "" });
          setDialogNotes("");
        }}
        title="Mark Payment as Failed"
        onConfirm={handleMarkFailed}
        isLoading={markFailedMutation.isPending}
        confirmLabel="Mark Failed"
        variant="danger"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-neutral-600">
            Confirm this payment has failed. This will update the invoice
            balance.
          </p>
          <Textarea
            label="Notes (optional)"
            placeholder="Reason for failure..."
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
        title="Cancel Payment"
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
        confirmLabel="Cancel Payment"
        variant="danger"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-neutral-600">
            Are you sure you want to cancel this payment? This action cannot be
            undone.
          </p>
          <Textarea
            label="Notes (optional)"
            placeholder="Reason for cancellation..."
            value={dialogNotes}
            onChange={(e) => setDialogNotes(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
