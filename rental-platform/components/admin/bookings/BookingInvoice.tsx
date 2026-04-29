
"use client"
import { useState } from "react"
import { useInvoiceDetail, useInvoiceBalance, useIssueInvoice, useCancelInvoice } from "@/lib/hooks/useBookings"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { AddAdjustmentModal } from "./AddAdjustmentModal"
import { Button } from "@/components/ui/Button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Modal, ModalFooter } from "@/components/ui/Modal"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { FileText } from "lucide-react"
import { INVOICE_STATUS_LABELS } from "@/lib/constants/invoice-statuses"

interface BookingInvoiceProps {
  bookingId: string
  invoiceId: string | null
}

export function BookingInvoice({ bookingId, invoiceId }: BookingInvoiceProps) {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelNotes, setCancelNotes] = useState("")

  const { data: invoice, isLoading: invoiceLoading } = useInvoiceDetail(invoiceId)
  const { data: balance, isLoading: balanceLoading } = useInvoiceBalance(invoiceId)
  const issueMutation = useIssueInvoice(invoiceId!, bookingId)
  const cancelMutation = useCancelInvoice(invoiceId!, bookingId)
  const { canManageFinance } = usePermissions()

  if (!invoiceId) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No invoice yet"
        description="Invoice will be generated when the booking is confirmed"
      />
    )
  }

  if (invoiceLoading || balanceLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!invoice) return null

  const isDraft = invoice.invoiceStatus === "Draft"
  const isIssued = invoice.invoiceStatus === "Issued"
  const isCancelled = invoice.invoiceStatus === "Cancelled"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">Invoice</h3>
        <StatusBadge status={invoice.invoiceStatus} label={INVOICE_STATUS_LABELS[invoice.invoiceStatus]} />
      </div>

      <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-neutral-500">Invoice Number</p>
            <p className="text-sm font-medium text-neutral-800">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Subtotal</p>
            <p className="text-sm font-medium text-neutral-800">{formatCurrency(invoice.subtotalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-sm font-semibold text-neutral-800">{formatCurrency(invoice.totalAmount)}</p>
          </div>
          {balance && (
            <>
              <div>
                <p className="text-xs text-neutral-500">Paid</p>
                <p className="text-sm font-medium text-green-600">{formatCurrency(balance.paidAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Remaining</p>
                <p className={`text-sm font-semibold ${balance.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(balance.remainingAmount)}
                </p>
              </div>
            </>
          )}
          {invoice.issuedAt && (
            <div>
              <p className="text-xs text-neutral-500">Issued At</p>
              <p className="text-sm text-neutral-800">{formatDate(invoice.issuedAt)}</p>
            </div>
          )}
          {invoice.dueDate && (
            <div>
              <p className="text-xs text-neutral-500">Due Date</p>
              <p className="text-sm text-neutral-800">{formatDate(invoice.dueDate)}</p>
            </div>
          )}
        </div>

        {invoice.items && invoice.items.length > 0 && (
          <div className="mt-3 border-t border-neutral-200 pt-3">
            <p className="text-xs font-medium text-neutral-500 mb-2">Line Items</p>
            <div className="space-y-1">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-neutral-600 truncate mr-2" title={item.description}>
                    {item.description} {item.quantity > 1 ? `× ${item.quantity}` : ""}
                  </span>
                  <span className={`font-medium whitespace-nowrap ${item.unitAmount < 0 ? "text-red-600" : "text-neutral-800"}`}>
                    {formatCurrency(item.quantity * item.unitAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {canManageFinance && isDraft && (
        <div className="flex flex-wrap gap-2">
          <Button variant="success" onClick={() => issueMutation.mutate()} isLoading={issueMutation.isPending}>
            Issue Invoice
          </Button>
          <Button variant="secondary" onClick={() => setShowAdjustmentModal(true)}>
            Add Adjustment
          </Button>
          <Button variant="danger" onClick={() => setShowCancelConfirm(true)}>
            Cancel Invoice
          </Button>
        </div>
      )}

      {isIssued && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
          This invoice has been issued and is read-only. No further modifications allowed.
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
          This invoice has been cancelled.
        </div>
      )}

      {showAdjustmentModal && (
        <AddAdjustmentModal
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          invoiceId={invoiceId}
          bookingId={bookingId}
        />
      )}

      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel Invoice">
        <div className="py-4 space-y-4">
          <p className="text-sm text-neutral-600">Are you sure you want to cancel this invoice? This action cannot be undone.</p>
          <textarea
            value={cancelNotes}
            onChange={(e) => setCancelNotes(e.target.value)}
            placeholder="Cancellation reason (optional)"
            className="w-full border border-neutral-200 rounded-md p-2 text-sm resize-none h-16 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 outline-none"
            disabled={cancelMutation.isPending}
          />
        </div>
        <ModalFooter>
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)} disabled={cancelMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={() => {
                cancelMutation.mutate(
                  { notes: cancelNotes || undefined },
                  { onSuccess: () => setShowCancelConfirm(false) }
                );
              }} 
              isLoading={cancelMutation.isPending}
            >
              Cancel Invoice
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}





