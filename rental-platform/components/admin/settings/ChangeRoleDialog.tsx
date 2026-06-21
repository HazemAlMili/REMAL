"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { useRoleTemplates } from "@/lib/hooks/useRbac";

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoleTemplateId: string;
  currentRoleName: string;
  onConfirm: (roleTemplateId: string) => void;
  isLoading: boolean;
}

export function ChangeRoleDialog({
  isOpen,
  onClose,
  currentRoleTemplateId,
  currentRoleName,
  onConfirm,
  isLoading,
}: ChangeRoleDialogProps) {
  const rolesQuery = useRoleTemplates();
  const [selectedRole, setSelectedRole] = useState(currentRoleTemplateId);

  // The dialog stays mounted between opens; re-sync the selection to the
  // user being edited only on the open transition, so a background refetch
  // can't overwrite an in-progress selection.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current) setSelectedRole(currentRoleTemplateId);
    wasOpen.current = isOpen;
  }, [isOpen, currentRoleTemplateId]);

  const roleOptions = (rolesQuery.data ?? [])
    .filter((role) => role.isActive)
    .map((role) => ({ value: role.id, label: role.name }));

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change admin role"
      onConfirm={() => onConfirm(selectedRole)}
      isLoading={isLoading}
      confirmLabel="Change role"
      confirmDisabled={
        !selectedRole || selectedRole === currentRoleTemplateId || rolesQuery.isLoading
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Current role: <strong>{currentRoleName}</strong>
        </p>
        <Select
          label="New role"
          options={roleOptions}
          value={selectedRole}
          onChange={(value) => setSelectedRole(String(value))}
          disabled={rolesQuery.isLoading}
        />
        <p className="text-xs text-neutral-500">
          Their current session will be revoked so the new access profile takes
          effect immediately.
        </p>
      </div>
    </ConfirmDialog>
  );
}
