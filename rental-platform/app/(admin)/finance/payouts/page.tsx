"use client";

import { useState } from "react";
import { PayoutsTable } from "@/components/admin/finance/PayoutsTable";
import { RecordPayoutModal } from "@/components/admin/finance/RecordPayoutModal";
import { MarkPayoutPaidDialog } from "@/components/admin/finance/MarkPayoutPaidDialog";
import { SchedulePayoutDialog } from "@/components/admin/finance/SchedulePayoutDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {
  useOwnerPayouts,
  useCancelPayout,
  payoutQueryKeys,
} from "@/lib/hooks/usePayouts";
import { useOwners } from "@/lib/hooks/useOwners";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function OwnerPayoutsPage() {
  const { canManageFinance } = usePermissions();
  const queryClient = useQueryClient();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [markPaidDialog, setMarkPaidDialog] = useState<{
    isOpen: boolean;
    payoutId: string;
  }>({ isOpen: false, payoutId: "" });
  const [scheduleDialog, setScheduleDialog] = useState<{
    isOpen: boolean;
    payoutId: string;
  }>({ isOpen: false, payoutId: "" });
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean;
    payoutId: string;
  }>({ isOpen: false, payoutId: "" });

  const { data: ownersData, isLoading: isLoadingOwners } = useOwners({
    pageSize: 100,
  });
  const owners = ownersData?.items || [];

  const { data: payouts, isLoading: isLoadingPayouts } =
    useOwnerPayouts(selectedOwnerId);
  const cancelMutation = useCancelPayout();

  const handleCancelPayout = () => {
    cancelMutation.mutate(
      { id: cancelDialog.payoutId, data: { notes: "Cancelled via Admin UI" } },
      {
        onSuccess: () => {
          toast.success("Payout cancelled");
          if (selectedOwnerId) {
            queryClient.invalidateQueries({
              queryKey: payoutQueryKeys.byOwner(selectedOwnerId),
            });
            queryClient.invalidateQueries({
              queryKey: payoutQueryKeys.summary(selectedOwnerId),
            });
          }
          setCancelDialog({ isOpen: false, payoutId: "" });
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Could not cancel payout");
        },
      }
    );
  };

  const ownerOptions = owners.map((owner) => ({
    value: owner.id,
    label: owner.name,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owner payouts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Select an owner to schedule, mark paid, or cancel payout records.
          </p>
        </div>
        {canManageFinance && (
          <Button
            onClick={() => {
              if (!selectedOwnerId) {
                toast.error("Choose an owner before creating a payout");
                return;
              }
              setCreateModalOpen(true);
            }}
            disabled={!selectedOwnerId}
          >
            Create payout
          </Button>
        )}
      </div>

      <div className="max-w-md">
        <Select
          label="Owner"
          placeholder={
            isLoadingOwners ? "Loading owners..." : "Choose an owner"
          }
          options={ownerOptions}
          value={selectedOwnerId}
          onChange={(value) => setSelectedOwnerId(value as string)}
        />
      </div>

      {!selectedOwnerId ? (
        <EmptyState
          title="Select an owner"
          description="Choose an owner to review pending, scheduled, and paid payouts."
        />
      ) : (
        <div className="space-y-4">
          {payouts?.length === 0 ? (
            <EmptyState
              title="No matching payouts"
              description="This owner has no payout records yet. Create a payout when a completed booking is ready to settle."
            />
          ) : (
            <PayoutsTable
              payouts={payouts ?? []}
              isLoading={isLoadingPayouts}
              onSchedule={(id) =>
                setScheduleDialog({ isOpen: true, payoutId: id })
              }
              onMarkPaid={(id) =>
                setMarkPaidDialog({ isOpen: true, payoutId: id })
              }
              onCancel={(id) => setCancelDialog({ isOpen: true, payoutId: id })}
            />
          )}
        </div>
      )}

      {/* Modals & Dialogs */}
      <RecordPayoutModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        ownerId={selectedOwnerId}
      />

      <MarkPayoutPaidDialog
        isOpen={markPaidDialog.isOpen}
        onClose={() => setMarkPaidDialog({ isOpen: false, payoutId: "" })}
        payoutId={markPaidDialog.payoutId}
        ownerId={selectedOwnerId}
      />

      <SchedulePayoutDialog
        isOpen={scheduleDialog.isOpen}
        onClose={() => setScheduleDialog({ isOpen: false, payoutId: "" })}
        payoutId={scheduleDialog.payoutId}
        ownerId={selectedOwnerId}
      />

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, payoutId: "" })}
        title="Cancel owner payout"
        onConfirm={handleCancelPayout}
        isLoading={cancelMutation.isPending}
        confirmLabel="Cancel payout"
        variant="danger"
      >
        <p className="text-sm text-neutral-600">
          Cancel this payout? Finance will stop tracking it as pending or
          scheduled. This cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
}
