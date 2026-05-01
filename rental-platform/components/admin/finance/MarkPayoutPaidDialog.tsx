"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import {
  markPaidSchema,
  type MarkPaidFormValues,
} from "@/lib/validations/payout.schema";
import { useMarkPayoutPaid, payoutQueryKeys } from "@/lib/hooks/usePayouts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface MarkPayoutPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId: string;
  ownerId?: string;
}

export function MarkPayoutPaidDialog({
  isOpen,
  onClose,
  payoutId,
  ownerId,
}: MarkPayoutPaidDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidSchema),
  });

  const markPaidMutation = useMarkPayoutPaid();

  const onSubmit = (data: MarkPaidFormValues) => {
    markPaidMutation.mutate(
      { id: payoutId, data },
      {
        onSuccess: () => {
          toast.success("Payout marked as paid");
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
          toast.error(err.response?.data?.message || "Failed to mark as paid");
        },
      }
    );
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Payout as Paid"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={markPaidMutation.isPending}
      confirmLabel="Confirm Paid"
    >
      <form
        id="mark-paid-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <p className="text-sm text-neutral-600">
          Confirm that this payout has been transferred to the owner.
        </p>
        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Transferred via InstaPay ref #12345"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </form>
    </ConfirmDialog>
  );
}
