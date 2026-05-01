"use client";

import { useState } from "react";
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
      title="Change Admin Role"
      onConfirm={() => onConfirm(selectedRole)}
      isLoading={isLoading}
      confirmLabel="Change Role"
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Current role: <strong>{roleLabels[currentRole]}</strong>
        </p>
        <Select
          label="New Role"
          options={ROLE_OPTIONS}
          value={selectedRole}
          onChange={(value) => setSelectedRole(value as AdminRole)}
        />
      </div>
    </ConfirmDialog>
  );
}
