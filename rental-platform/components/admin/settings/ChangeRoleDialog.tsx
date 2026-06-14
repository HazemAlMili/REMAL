"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { AdminRole } from "@/lib/types";

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: AdminRole;
  onConfirm: (newRole: AdminRole) => void;
  isLoading: boolean;
}

const ROLE_OPTIONS = [
  { value: "SuperAdmin", label: "Super Admin" },
  { value: "Sales", label: "Sales" },
  { value: "Finance", label: "Finance" },
  { value: "Tech", label: "Tech" },
];

export function ChangeRoleDialog({
  isOpen,
  onClose,
  currentRole,
  onConfirm,
  isLoading,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRole>(currentRole);

  // The dialog stays mounted between opens; re-sync the selection to the
  // user being edited only on the open transition, so a background refetch
  // can't overwrite an in-progress selection.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current) setSelectedRole(currentRole);
    wasOpen.current = isOpen;
  }, [isOpen, currentRole]);

  const roleLabels = {
    SuperAdmin: "Super Admin",
    Sales: "Sales",
    Finance: "Finance",
    Tech: "Tech",
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change admin role"
      onConfirm={() => onConfirm(selectedRole)}
      isLoading={isLoading}
      confirmLabel="Change role"
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Current role: <strong>{roleLabels[currentRole]}</strong>
        </p>
        <Select
          label="New role"
          options={ROLE_OPTIONS}
          value={selectedRole}
          onChange={(value) => setSelectedRole(value as AdminRole)}
        />
        <p className="text-xs text-neutral-500">
          The new role takes effect on their next sign-in or token refresh
          (within 15 minutes). Their current screen may not update immediately.
        </p>
      </div>
    </ConfirmDialog>
  );
}
