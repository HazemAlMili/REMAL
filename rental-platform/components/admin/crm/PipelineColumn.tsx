import { CrmLeadStatus, CrmLeadListItemResponse } from "@/lib/types/crm.types";
import { LeadCard } from "./LeadCard";
import { Badge } from "@/components/ui/Badge";

interface PipelineColumnProps {
  status: CrmLeadStatus;
  label: string;
  leads: CrmLeadListItemResponse[];
  isLoading: boolean;
}

export function PipelineColumn({
  label,
  leads,
  isLoading,
}: PipelineColumnProps) {
  return (
    <div className="bg-neutral-100/50 flex w-[320px] max-w-[320px] flex-1 shrink-0 flex-col rounded-lg p-4 shadow-inner">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">{label}</h3>
        <Badge
          variant={leads.length > 0 ? "info" : "neutral"}
          className="rounded-full px-2 py-0.5 text-xs"
        >
          {leads.length}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {isLoading ? (
          <span className="py-4 text-center text-sm italic text-neutral-500">
            Loading...
          </span>
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-neutral-300 p-6">
            <span className="text-sm italic text-neutral-400">
              No leads in this stage
            </span>
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
