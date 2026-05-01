"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import { OwnerListItemResponse } from "@/lib/types/owner.types";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PaginationMeta } from "@/lib/api/types";
import { ROUTES } from "@/lib/constants/routes";

interface OwnerTableProps {
  data: OwnerListItemResponse[];
  pagination: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onToggleStatus: (owner: OwnerListItemResponse) => void;
}

export function OwnerTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onToggleStatus,
}: OwnerTableProps) {
  const router = useRouter();
  const { canManageOwners } = usePermissions();

  const columns = React.useMemo<ColumnDef<OwnerListItemResponse>[]>(() => {
    const cols: ColumnDef<OwnerListItemResponse>[] = [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const email: string | null = row.getValue("email");
          return email ? (
            <span className="text-neutral-700">{email}</span>
          ) : (
            <span className="text-neutral-400">-</span>
          );
        },
      },
      {
        accessorKey: "commissionRate",
        header: "Commission Rate (%)",
        cell: ({ row }) => {
          const rate: number = row.getValue("commissionRate");
          return <span className="font-medium">{Math.round(rate)}%</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status: "active" | "inactive" = row.getValue("status");
          return (
            <Badge variant={status === "active" ? "success" : "neutral"}>
              {status === "active" ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const dateStr: string = row.getValue("createdAt");
          const date = new Date(dateStr);
          return (
            <span className="text-neutral-600">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const owner = row.original;
          return (
            <div className="flex items-center justify-end gap-2 text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0"
                title="View details"
                onClick={() =>
                  router.push(ROUTES.admin.owners.detail(owner.id))
                }
              >
                <Eye className="h-4 w-4 text-neutral-500" />
                <span className="sr-only">View</span>
              </Button>

              {canManageOwners && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 text-neutral-500"
                    title="Edit owner"
                    onClick={() =>
                      router.push(ROUTES.admin.owners.edit(owner.id))
                    }
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => onToggleStatus(owner)}
                    title={
                      owner.status === "active" ? "Deactivate" : "Activate"
                    }
                  >
                    {owner.status === "active" ? (
                      <PowerOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Power className="h-4 w-4 text-green-500" />
                    )}
                    <span className="sr-only">Toggle Status</span>
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ];

    return cols;
  }, [canManageOwners, onToggleStatus, router]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
      emptyMessage="No owners found. Try adjusting your filters."
    />
  );
}
