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
        title="Failed to load admin users"
        description="There was an error loading the admin users list. Please try again."
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
          toastSuccess("Role updated successfully");
          handleCloseRoleDialog();
        },
        onError: (error: Error) => {
          toastError(error.message || "Failed to update role");
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
          toastError(error.message || "Failed to update status");
        },
      }
    );
  };

  if (!canManageAdminUsers) {
    return (
      <EmptyState
        title="Access Denied"
        description="You do not have permission to manage admin users."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Admin Users</h2>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Admin User
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
          title="No admin users found"
          description="There are no admin users matching your search criteria."
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
          statusDialog.currentIsActive ? "Deactivate Admin" : "Activate Admin"
        }
        onConfirm={handleStatusConfirm}
        isLoading={toggleStatusMutation.isPending}
        confirmLabel={statusDialog.currentIsActive ? "Deactivate" : "Activate"}
        variant={statusDialog.currentIsActive ? "danger" : "primary"}
      >
        <p className="text-sm text-neutral-600">
          {statusDialog.currentIsActive
            ? "Are you sure you want to deactivate this admin user? They will no longer be able to log in."
            : "Are you sure you want to activate this admin user?"}
        </p>
      </ConfirmDialog>
    </div>
  );
}
