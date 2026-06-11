"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useAdminUsers,
  useChangeAdminRole,
  useToggleAdminStatus,
} from "@/lib/hooks/useAdminUsers";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { AdminRole } from "@/lib/types";

import { AdminUserTable } from "./AdminUserTable";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { CreateAdminUserModal } from "./CreateAdminUserModal";

export function AdminUsersSection() {
  const { canManageAdminUsers } = usePermissions();
  const [roleDialog, setRoleDialog] = useState<{
    isOpen: boolean;
    userId: string;
    currentRole: AdminRole;
  }>({ isOpen: false, userId: "", currentRole: "Sales" });

  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    userId: string;
    currentIsActive: boolean;
  }>({ isOpen: false, userId: "", currentIsActive: true });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, isError } = useAdminUsers({ includeInactive: true });
  const changeRoleMutation = useChangeAdminRole();
  const toggleStatusMutation = useToggleAdminStatus();

  if (isError) {
    return (
      <EmptyState
        title="Could not load admin users"
        description="We could not load admin users. Retry before changing access."
      />
    );
  }

  const handleOpenRoleDialog = (userId: string, currentRole: AdminRole) => {
    setRoleDialog({ isOpen: true, userId, currentRole });
  };

  const handleCloseRoleDialog = () => {
    setRoleDialog({ isOpen: false, userId: "", currentRole: "Sales" });
  };

  const handleRoleConfirm = (newRole: AdminRole) => {
    changeRoleMutation.mutate(
      { id: roleDialog.userId, role: newRole },
      {
        onSuccess: () => {
          toastSuccess("Admin role updated");
          handleCloseRoleDialog();
        },
        onError: (error: Error) => {
          toastError(error.message || "Could not update admin role");
        },
      }
    );
  };

  const handleOpenStatusDialog = (userId: string, currentIsActive: boolean) => {
    setStatusDialog({ isOpen: true, userId, currentIsActive });
  };

  const handleCloseStatusDialog = () => {
    setStatusDialog({ isOpen: false, userId: "", currentIsActive: true });
  };

  const handleStatusConfirm = () => {
    toggleStatusMutation.mutate(
      { id: statusDialog.userId, isActive: !statusDialog.currentIsActive },
      {
        onSuccess: () => {
          toastSuccess("Admin user status updated");
          handleCloseStatusDialog();
        },
        onError: (error: Error) => {
          toastError(error.message || "Could not update admin status");
        },
      }
    );
  };

  if (!canManageAdminUsers) {
    return (
      <EmptyState
        title="Admin user access required"
        description="Only super admins can manage admin users and role access."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Admin users</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create operator accounts, assign roles, and deactivate access when
            needed.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create admin user
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} columns={6} />
      ) : data?.items && data.items.length > 0 ? (
        <AdminUserTable
          users={data.items}
          isLoading={isLoading}
          onChangeRole={handleOpenRoleDialog}
          onToggleStatus={handleOpenStatusDialog}
        />
      ) : (
        <EmptyState
          title="No admin users created"
          description="Create the first admin user to grant portal access."
        />
      )}

      <CreateAdminUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <ChangeRoleDialog
        isOpen={roleDialog.isOpen}
        onClose={handleCloseRoleDialog}
        currentRole={roleDialog.currentRole}
        onConfirm={handleRoleConfirm}
        isLoading={changeRoleMutation.isPending}
      />

      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={handleCloseStatusDialog}
        title={
          statusDialog.currentIsActive
            ? "Deactivate admin user"
            : "Activate admin user"
        }
        onConfirm={handleStatusConfirm}
        isLoading={toggleStatusMutation.isPending}
        confirmLabel={
          statusDialog.currentIsActive
            ? "Deactivate admin user"
            : "Activate admin user"
        }
        variant={statusDialog.currentIsActive ? "danger" : "primary"}
      >
        <p className="text-sm text-neutral-600">
          {statusDialog.currentIsActive
            ? "Deactivate this admin user? They will no longer be able to sign in."
            : "Activate this admin user? They will be able to sign in again."}
        </p>
      </ConfirmDialog>
    </div>
  );
}
