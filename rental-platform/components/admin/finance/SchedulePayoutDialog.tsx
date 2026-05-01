"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import {
  scheduleSchema,
  type ScheduleFormValues,
} from "@/lib/validations/payout.schema";
import { useSchedulePayout, payoutQueryKeys } from "@/lib/hooks/usePayouts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface SchedulePayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId: string;
  ownerId?: string;
}

export function SchedulePayoutDialog({
  isOpen,
  onClose,
  payoutId,
  ownerId,
}: SchedulePayoutDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  const scheduleMutation = useSchedulePayout();

  const onSubmit = (data: ScheduleFormValues) => {
    scheduleMutation.mutate(
      { id: payoutId, data },
      {
        onSuccess: () => {
          toast.success("Payout scheduled");
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
          toast.error(
            err.response?.data?.message || "Failed to schedule payout"
          );
        },
      }
    );
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Payout"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={scheduleMutation.isPending}
      confirmLabel="Schedule"
    >
      <form
        id="schedule-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <p className="text-sm text-neutral-600">
          Schedule this payout for future processing.
        </p>
        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Scheduled for end of month batch"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </form>
    </ConfirmDialog>
  );
}
