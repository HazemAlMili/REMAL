"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  createPayoutSchema,
  type CreatePayoutFormValues,
} from "@/lib/validations/payout.schema";
import { useCreatePayout } from "@/lib/hooks/usePayouts";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { payoutQueryKeys } from "@/lib/hooks/usePayouts";

interface RecordPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
}

export function RecordPayoutModal({
  isOpen,
  onClose,
  ownerId,
}: RecordPayoutModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePayoutFormValues>({
    resolver: zodResolver(createPayoutSchema),
    defaultValues: {
      bookingId: "",
      commissionRate: undefined,
      notes: "",
    },
  });

  const createMutation = useCreatePayout();

  const onSubmit = (data: CreatePayoutFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Payout record created");
        if (ownerId) {
          queryClient.invalidateQueries({
            queryKey: payoutQueryKeys.byOwner(ownerId),
          });
          queryClient.invalidateQueries({
            queryKey: payoutQueryKeys.summary(ownerId),
          });
        }
        reset();
        onClose();
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to create payout");
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Payout Record"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Booking ID"
          placeholder="Enter Booking ID..."
          error={errors.bookingId?.message}
          {...register("bookingId")}
        />
        <Input
          label="Commission Rate (%)"
          type="number"
          placeholder="e.g. 20 for 20%"
          error={errors.commissionRate?.message}
          helperText="Enter as percentage (0-100). API calculates amounts automatically."
          {...register("commissionRate", { valueAsNumber: true })}
        />
        <Textarea
          label="Notes"
          placeholder="Optional notes..."
          error={errors.notes?.message}
          {...register("notes")}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Payout
          </Button>
        </div>
      </form>
    </Modal>
  );
}
