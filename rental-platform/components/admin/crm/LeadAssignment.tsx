"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  useLeadAssignment,
  useAssignLead,
  useUnassignLead,
} from "@/lib/hooks/useCrm";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
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
  const { data: adminUsers, isLoading: usersLoading } = useAdminUsers();
  const assignMutation = useAssignLead(leadId);
  const unassignMutation = useUnassignLead(leadId);

  const salesUsers = (adminUsers ?? []).filter(
    (u) => u.isActive && (u.role === "Sales" || u.role === "SuperAdmin")
  );

  const getAdminName = (userId: string) => {
    const user = adminUsers?.find((u) => u.id === userId);
    return user?.name ?? "Unknown Admin";
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
    <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Assignment</h3>

      {assignment?.assignedAdminUserId ? (
        <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
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
              Unassign
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="text-sm italic text-neutral-500">Unassigned</p>
        </div>
      )}

      {canAssignLeads && (
        <div className="flex items-end gap-2">
          <Select
            value={selectedUserId}
            onChange={(val) => setSelectedUserId(val as string)}
            options={salesUsers.map((u) => ({
              value: u.id,
              label: `${u.name} (${u.role})`,
            }))}
            placeholder="Select sales person..."
          />
          <Button
            onClick={handleAssign}
            isLoading={assignMutation.isPending}
            disabled={!selectedUserId}
            size="sm"
          >
            Assign
          </Button>
        </div>
      )}

      {showUnassignConfirm && (
        <ConfirmDialog
          isOpen={showUnassignConfirm}
          onCancel={() => setShowUnassignConfirm(false)}
          onConfirm={handleUnassign}
          title="Unassign Lead"
          description="Are you sure you want to remove the current assignment?"
        />
      )}
    </div>
  );
}
