"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import {
  cancelPayoutSchema,
  type CancelPayoutFormValues,
} from "@/lib/validations/payout.schema";
import { useCancelPayout, payoutQueryKeys } from "@/lib/hooks/usePayouts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface CancelPayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId: string;
  ownerId?: string;
}

export function CancelPayoutDialog({
  isOpen,
  onClose,
  payoutId,
  ownerId,
}: CancelPayoutDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CancelPayoutFormValues>({
    resolver: zodResolver(cancelPayoutSchema),
  });

  const cancelMutation = useCancelPayout();

  const onSubmit = (data: CancelPayoutFormValues) => {
    cancelMutation.mutate(
      { id: payoutId, data },
      {
        onSuccess: () => {
          toast.success("Payout cancelled");
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
          toast.error(err.response?.data?.message || "Failed to cancel payout");
        },
      }
    );
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Payout"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={cancelMutation.isPending}
      confirmLabel="Confirm Cancel"
      variant="danger"
    >
      <form
        id="cancel-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <p className="text-sm text-neutral-600">
          Cancel this payout. This action cannot be undone.
        </p>
        <Textarea
          label="Notes (optional)"
          placeholder="Reason for cancellation..."
          error={errors.notes?.message}
          {...register("notes")}
        />
      </form>
    </ConfirmDialog>
  );
}
