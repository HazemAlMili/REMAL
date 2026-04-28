"use client";

import { useState } from "react";
import {
  CRM_VALID_TRANSITIONS,
  CRM_STATUS_LABELS,
} from "@/lib/constants/booking-statuses";
import { useUpdateLeadStatus } from "@/lib/hooks/useCrm";
import { StatusTransitionDialog } from "@/components/admin/crm/StatusTransitionDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { CrmLeadStatus } from "@/lib/types/crm.types";

const STATUS_BUTTON_VARIANT: Record<string, "success" | "danger" | "warning"> =
  {
    Relevant: "success",
    Booked: "success",
    Confirmed: "success",
    CheckIn: "success",
    Completed: "success",
    NotRelevant: "danger",
    Cancelled: "danger",
    NoAnswer: "warning",
  };

interface LeadStatusTransitionProps {
  leadId: string;
  currentStatus: CrmLeadStatus;
}

export function LeadStatusTransition({
  leadId,
  currentStatus,
}: LeadStatusTransitionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<CrmLeadStatus | null>(null);
  const mutation = useUpdateLeadStatus(leadId);

  const allowedTransitions = CRM_VALID_TRANSITIONS[currentStatus] ?? [];

  const handleTransitionClick = (status: CrmLeadStatus) => {
    setTargetStatus(status);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!targetStatus) return;
    mutation.mutate(
      { leadStatus: targetStatus },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setTargetStatus(null);
        },
      }
    );
    // Note: The notes parameter is ignored in the mutation payload
    // since the API does not expect notes on status transition endpoint,
    // as per Ticket instruction: "[x] Do NOT send a notes field in the PATCH request body — the API only accepts { leadStatus }."
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-600">
            Current Status:
          </span>
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {allowedTransitions.length > 0 ? (
        <div className="space-y-3 border-t border-neutral-50 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Move to:
          </span>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => (
              <Button
                key={status}
                variant={STATUS_BUTTON_VARIANT[status] ?? "secondary"}
                size="sm"
                onClick={() => handleTransitionClick(status)}
              >
                {CRM_STATUS_LABELS[status] ?? status}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-neutral-50 pt-4">
          <span className="text-sm italic text-neutral-400">
            No further actions available
          </span>
        </div>
      )}

      <StatusTransitionDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setTargetStatus(null);
        }}
        onConfirm={handleConfirm}
        targetStatus={targetStatus}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
