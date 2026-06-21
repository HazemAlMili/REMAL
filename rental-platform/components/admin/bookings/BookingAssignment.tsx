"use client";

import { useState } from "react";
import {
  useBookingAssignment,
  useAssignBooking,
  useUnassignBooking,
} from "@/lib/hooks/useBookings";
import { useAssignableAdmins } from "@/lib/hooks/useCrm";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/utils/format";

interface BookingAssignmentProps {
  bookingId: string;
}

export function BookingAssignment({ bookingId }: BookingAssignmentProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const { canAssignLeads } = usePermissions();

  // Assignment reads and writes use the same granular permission.
  const { data: assignment, isLoading: assignmentLoading } =
    useBookingAssignment(bookingId, { enabled: canAssignLeads });
  const { data: assignees, isLoading: usersLoading } =
    useAssignableAdmins(canAssignLeads);
  const assignMutation = useAssignBooking(bookingId);
  const unassignMutation = useUnassignBooking(bookingId);

  const getAdminName = (userId: string) => {
    const user = assignees?.find((u) => u.id === userId);
    return user?.name ?? "Unknown admin";
  };

  const handleAssign = () => {
    if (!selectedUserId) return;
    assignMutation.mutate(
      { assignedAdminUserId: selectedUserId },
      { onSuccess: () => setSelectedUserId("") }
    );
  };

  const handleUnassign = () => {
    unassignMutation.mutate(undefined, {
      onSuccess: () => setShowUnassignConfirm(false),
    });
  };

  if (!canAssignLeads) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">Assignment</h3>
        <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
          You do not have permission to manage assignments.
        </p>
      </div>
    );
  }

  if (assignmentLoading || usersLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-700">Assignment</h3>

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
              Remove assignment
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="text-sm italic text-neutral-500">
            No sales owner assigned
          </p>
        </div>
      )}

      {canAssignLeads && (
        <div className="flex items-end gap-2">
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
            size="sm"
          >
            Assign booking
          </Button>
        </div>
      )}

      {showUnassignConfirm && (
        <ConfirmDialog
          isOpen={showUnassignConfirm}
          onCancel={() => setShowUnassignConfirm(false)}
          onConfirm={handleUnassign}
          title="Remove booking assignment"
          description="Remove the current sales owner from this booking? It will remain visible in the booking list."
          confirmLabel="Remove assignment"
        />
      )}
    </div>
  );
}
