"use client";

import { format } from "date-fns";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminUserResponse, AdminRole } from "@/lib/types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminUserTableProps {
  users: AdminUserResponse[];
  isLoading: boolean;
  onChangeRole: (id: string, currentRole: AdminRole) => void;
  onToggleStatus: (id: string, currentIsActive: boolean) => void;
}

export function AdminUserTable({
  users,
  isLoading,
  onChangeRole,
  onToggleStatus,
}: AdminUserTableProps) {
  const { user: currentUser } = useAuthStore();

  if (isLoading) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  if (!users?.length) {
    return (
      <EmptyState
        title="No matching admin users"
        description="There are no admin users matching your search criteria."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className="h-9 px-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Name
            </th>
            <th className="h-9 px-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Email
            </th>
            <th className="h-9 px-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Role
            </th>
            <th className="h-9 px-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Status
            </th>
            <th className="h-9 px-3 text-start text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Created
            </th>
            <th className="h-9 px-3 text-end text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {users.map((adminUser) => {
            const isSelf = currentUser?.userId === adminUser.id;

            return (
              <tr
                key={adminUser.id}
                className={`transition-colors hover:bg-neutral-50 ${!adminUser.isActive ? "bg-neutral-50 text-neutral-500" : ""}`}
              >
                <td className="h-[var(--portal-row-height)] px-3 py-2 align-middle font-medium text-neutral-900">
                  {adminUser.name}
                  {isSelf && (
                    <span className="ms-2 text-xs font-medium text-info">
                      (you)
                    </span>
                  )}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 align-middle text-neutral-500">
                  {adminUser.email}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 align-middle">
                  <RoleBadge role={adminUser.role} />
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 align-middle">
                  <Badge variant={adminUser.isActive ? "success" : "neutral"}>
                    {adminUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 align-middle text-neutral-500">
                  {format(new Date(adminUser.createdAt), "MMM d, yyyy")}
                </td>
                <td className="h-[var(--portal-row-height)] px-3 py-2 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onChangeRole(adminUser.id, adminUser.role)}
                      disabled={isSelf}
                      title={
                        isSelf ? "Cannot change your own role" : "Change role"
                      }
                    >
                      Change role
                    </Button>
                    <Button
                      size="sm"
                      variant={adminUser.isActive ? "danger" : "primary"}
                      onClick={() =>
                        onToggleStatus(adminUser.id, adminUser.isActive)
                      }
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "Cannot deactivate your own account"
                          : adminUser.isActive
                            ? "Deactivate"
                            : "Activate"
                      }
                    >
                      {adminUser.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  const roleVariants: Record<AdminRole, BadgeVariant> = {
    SuperAdmin: "danger",
    Sales: "info",
    Finance: "success",
    Tech: "warning",
  };

  const roleLabels = {
    SuperAdmin: "Super Admin",
    Sales: "Sales",
    Finance: "Finance",
    Tech: "Tech",
  };

  return <Badge variant={roleVariants[role]}>{roleLabels[role]}</Badge>;
}
