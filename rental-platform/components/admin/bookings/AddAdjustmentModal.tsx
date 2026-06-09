
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAddInvoiceAdjustment } from "@/lib/hooks/useBookings"
import { Modal, ModalFooter } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { adjustmentSchema } from "./schemas"
import type { AddInvoiceManualAdjustmentRequest } from "@/lib/types/booking.types"

interface AddAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceId: string
  bookingId: string
}

export function AddAdjustmentModal({ isOpen, onClose, invoiceId, bookingId }: AddAdjustmentModalProps) {
  const addAdjustmentMutation = useAddInvoiceAdjustment(invoiceId, bookingId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddInvoiceManualAdjustmentRequest>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unitAmount: 0,
    },
  })

  const onSubmit = (data: AddInvoiceManualAdjustmentRequest) => {
    addAdjustmentMutation.mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add invoice adjustment" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <Input
          label="Adjustment description"
          {...register("description")}
          error={errors.description?.message}
          placeholder="e.g., Early bird discount, Extra cleaning fee"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            error={errors.quantity?.message}
            required
          />
          <Input
            label="Unit amount (EGP)"
            type="number"
            step="0.01"
            {...register("unitAmount", { valueAsNumber: true })}
            error={errors.unitAmount?.message}
            placeholder="Negative = discount"
            required
          />
        </div>

        <p className="text-xs text-neutral-500">
          Use a negative amount for a discount and a positive amount for an extra fee.
        </p>

        <ModalFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" type="button" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addAdjustmentMutation.isPending}>
              Add adjustment
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  )
}


