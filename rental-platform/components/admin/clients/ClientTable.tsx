"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";
import { ClientListItemResponse } from "@/lib/types/client.types";
import { PaginationMeta } from "@/lib/api/types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format";
import { maskPhone } from "@/lib/utils/format";

interface ClientTableProps {
  clients: ClientListItemResponse[];
  isLoading: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ClientTable({
  clients,
  isLoading,
  pagination,
  onPageChange,
}: ClientTableProps) {
  const router = useRouter();

  const columns = React.useMemo<ColumnDef<ClientListItemResponse>[]>(() => {
    const cols: ColumnDef<ClientListItemResponse>[] = [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
          const phone: string = row.getValue("phone");
          return <span className="font-medium">{maskPhone(phone)}</span>;
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const email: string | null = row.getValue("email");
          return email ? (
            <span className="text-neutral-700">{email}</span>
          ) : (
            <span className="text-neutral-400">—</span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive: boolean = row.getValue("isActive");
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ row }) => {
          const dateStr: string = row.getValue("createdAt");
          return (
            <span className="text-neutral-600">{formatDate(dateStr)}</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center justify-end text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(ROUTES.admin.clients.detail(client.id))
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          );
        },
      },
    ];

    return cols;
  }, [router]);

  return (
    <DataTable
      columns={columns}
      data={clients}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
      emptyMessage="No clients found. Try adjusting your filters."
    />
  );
}
