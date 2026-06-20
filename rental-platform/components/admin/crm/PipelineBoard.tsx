"use client";

import { useLeadsPipeline } from "@/lib/hooks/useCrm";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineColumnSkeleton } from "./PipelineColumnSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Users, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CRM_PIPELINE_COLUMNS,
  CRM_CLOSED_STATUSES,
  CRM_STATUS_LABELS,
} from "@/lib/constants/booking-statuses";
import { queryKeys } from "@/lib/utils/query-keys";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import type { CrmLeadStatus } from "@/lib/types/crm.types";

export default function PipelineBoard() {
  const { groupedLeads, totalCount, isLoading, isError, refetch } =
    useLeadsPipeline();
  const [isClosedSectionOpen, setIsClosedSectionOpen] = useState(false);
  const queryClient = useQueryClient();

  // Single drop handler so a board move keeps the board, the dashboard open-count,
  // AND the moved lead's detail view in sync — opening the card after a drag now
  // shows the new status without a manual refresh.
  const handleDropLead = async (leadId: string, target: CrmLeadStatus) => {
    try {
      const { crmService } = await import("@/lib/api/services/crm.service");
      await crmService.updateLeadStatus(leadId, { leadStatus: target });
      toastSuccess(`Lead moved to ${CRM_STATUS_LABELS[target] || target}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.crm.leads() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.crm.openCount() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.crm.leadDetail(leadId),
        }),
      ]);
    } catch {
      toastError("Cannot move lead to this stage");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-start gap-4 overflow-x-auto pb-4">
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-8 w-8 text-red-500" />}
        title="Could not load leads"
        description="We could not reach the leads pipeline. Retry to refresh the board."
        action={
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        }
      />
    );
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8 text-neutral-400" />}
        title="Pipeline is empty"
        description="New client enquiries will appear here when they submit a booking request."
      />
    );
  }

  const closedLeadsCount = CRM_CLOSED_STATUSES.reduce(
    (acc, status) => acc + (groupedLeads[status]?.length || 0),
    0
  );

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-hidden">
      {/* Active Pipeline Board */}
      <div className="flex h-full flex-1 items-start gap-4 overflow-x-auto overflow-y-hidden pb-4">
        {CRM_PIPELINE_COLUMNS.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            label={CRM_STATUS_LABELS[status] || status}
            leads={groupedLeads[status] || []}
            isLoading={false}
            onDropLead={handleDropLead}
          />
        ))}
      </div>

      {/* Closed Section Accordion */}
      {totalCount > 0 && (
        <div className="mt-auto flex flex-col gap-4 border-t border-neutral-200 pt-4">
          <button
            onClick={() => setIsClosedSectionOpen((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            {isClosedSectionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isClosedSectionOpen ? "Hide closed leads" : "Show closed leads"} ({closedLeadsCount})
          </button>

          {isClosedSectionOpen && (
            <div className="flex items-start gap-4 overflow-x-auto pb-4">
              {CRM_CLOSED_STATUSES.map((status) => (
                <PipelineColumn
                  key={status}
                  status={status}
                  label={CRM_STATUS_LABELS[status] || status}
                  leads={groupedLeads[status] || []}
                  isLoading={false}
                  onDropLead={handleDropLead}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
