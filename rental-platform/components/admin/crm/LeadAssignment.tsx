"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  useLeadAssignment,
  useAssignLead,
  useUnassignLead,
  useAssignableAdmins,
} from "@/lib/hooks/useCrm";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";

interface LeadAssignmentProps {
  leadId: string;
}

export function LeadAssignment({ leadId }: LeadAssignmentProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const { canAssignLeads } = usePermissions();

  const { data: assignment, isLoading: assignmentLoading } =
    useLeadAssignment(leadId);
  const { data: assignees, isLoading: usersLoading } =
    useAssignableAdmins(canAssignLeads);
  const assignMutation = useAssignLead(leadId);
  const unassignMutation = useUnassignLead(leadId);

  const getAdminName = (userId: string) => {
    const user = assignees?.find((u) => u.id === userId);
    return user?.name ?? "Unknown admin";
  };

  const handleAssign = () => {
    if (!selectedUserId) return;
    assignMutation.mutate(
      { assignedAdminUserId: selectedUserId },
      {
        onSuccess: () => {
          setSelectedUserId("");
        },
      }
    );
  };

  const handleUnassign = () => {
    unassignMutation.mutate(undefined, {
      onSuccess: () => {
        setShowUnassignConfirm(false);
      },
    });
  };

  if (assignmentLoading || usersLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  // Treat assignment missing (404) as unassigned, meaning assignment may be undefined
  return (
    <div className="space-y-4 rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white p-4">
      <h3 className="border-b border-neutral-200 pb-2 text-sm font-semibold text-neutral-900">
        Assignment
      </h3>

      {assignment?.assignedAdminUserId ? (
        <div className="flex items-center justify-between rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 p-3">
          <div>
            <p className="text-sm font-medium text-neutral-800">
              {getAdminName(assignment.assignedAdminUserId)}
            </p>
            <p className="text-xs text-neutral-500">
              Assigned {formatRelativeTime(assignment.assignedAt)}
            </p>
          </div>
          {canAssignLeads && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnassignConfirm(true)}
            >
              Remove assignment
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm italic text-neutral-500">
            No sales owner assigned
          </p>
        </div>
      )}

      {canAssignLeads && (
        <div className="flex items-stretch gap-2">
          <Select
            value={selectedUserId}
            onChange={(val) => setSelectedUserId(val as string)}
            options={(assignees ?? []).map((u) => ({
              value: u.id,
              label: `${u.name} (${u.roleName})`,
            }))}
            placeholder="Choose a sales owner"
          />
          <Button
            onClick={handleAssign}
            isLoading={assignMutation.isPending}
            disabled={!selectedUserId}
            className="!h-[var(--portal-control-height)] shrink-0"
          >
            Assign lead
          </Button>
        </div>
      )}

      {showUnassignConfirm && (
        <ConfirmDialog
          isOpen={showUnassignConfirm}
          onCancel={() => setShowUnassignConfirm(false)}
          onConfirm={handleUnassign}
          title="Remove lead assignment"
          description="Remove the current sales owner from this lead? It will remain visible in the pipeline."
          confirmLabel="Remove assignment"
        />
      )}
    </div>
  );
}
