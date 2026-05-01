"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
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
        title="No admin users found"
        description="There are no admin users matching your search criteria."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50/50 border-b">
          <tr>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Name
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Email
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Role
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Status
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Created
            </th>
            <th className="h-10 px-4 text-right font-medium text-neutral-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {users.map((adminUser) => {
            const isSelf = currentUser?.userId === adminUser.id;

            return (
              <tr
                key={adminUser.id}
                className={`hover:bg-neutral-50 ${!adminUser.isActive ? "bg-neutral-50 opacity-60" : ""}`}
              >
                <td className="p-4 align-middle font-medium">
                  {adminUser.name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-blue-600">(you)</span>
                  )}
                </td>
                <td className="p-4 align-middle text-neutral-500">
                  {adminUser.email}
                </td>
                <td className="p-4 align-middle">
                  <RoleBadge role={adminUser.role} />
                </td>
                <td className="p-4 align-middle">
                  <Badge variant={adminUser.isActive ? "success" : "neutral"}>
                    {adminUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-4 align-middle text-neutral-500">
                  {format(new Date(adminUser.createdAt), "MMM d, yyyy")}
                </td>
                <td className="p-4 text-right">
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
                      Change Role
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
  const roleColors = {
    SuperAdmin: "bg-purple-100 text-purple-700",
    Sales: "bg-blue-100 text-blue-700",
    Finance: "bg-green-100 text-green-700",
    Tech: "bg-orange-100 text-orange-700",
  };

  const roleLabels = {
    SuperAdmin: "Super Admin",
    Sales: "Sales",
    Finance: "Finance",
    Tech: "Tech",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}
