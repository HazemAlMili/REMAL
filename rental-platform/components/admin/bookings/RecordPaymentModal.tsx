import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePayment } from "@/lib/hooks/useBookings";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constants/payment-methods";
import { recordPaymentSchema } from "./schemas";
import type { CreatePaymentRequest } from "@/lib/types/booking.types";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export function RecordPaymentModal({ isOpen, onClose, bookingId }: RecordPaymentModalProps) {
  const createMutation = useCreatePayment();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreatePaymentRequest>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      bookingId,
      paymentMethod: "Cash",
      amount: undefined as unknown as number, // Let the user type it
      referenceNumber: "",
      notes: "",
    },
  });

  const onSubmit = (data: CreatePaymentRequest) => {
    createMutation.mutate(
      {
        ...data,
        bookingId,  // always attach current booking
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record payment" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <Input
          label="Payment amount (EGP)"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
          required
        />

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select
              label="Payment method"
              options={PAYMENT_METHOD_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.paymentMethod?.message}
              required
            />
          )}
        />

        <Input
          label="Receipt reference (optional)"
          {...register("referenceNumber")}
          error={errors.referenceNumber?.message}
          placeholder="InstaPay ref, transfer ID, etc."
        />

        <div className="grid gap-1">
          <label className="text-sm font-medium text-neutral-700">Internal note (optional)</label>
          <textarea
            {...register("notes")}
            placeholder="Add payment context for the finance team"
            className="w-full border border-neutral-200 rounded-md p-2 text-sm resize-none h-20 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" type="button" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Record payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}




