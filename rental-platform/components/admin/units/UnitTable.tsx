"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import { UnitListItemResponse, UnitType } from "@/lib/types";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PaginationMeta } from "@/lib/api/types";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/format";

interface UnitTableProps {
  data: UnitListItemResponse[];
  pagination: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onToggleStatus: (unit: UnitListItemResponse) => void;
}

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

export function UnitTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onToggleStatus,
}: UnitTableProps) {
  const router = useRouter();
  const { canManageUnits } = usePermissions();

  const columns = React.useMemo<ColumnDef<UnitListItemResponse>[]>(() => {
    const cols: ColumnDef<UnitListItemResponse>[] = [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "areaId",
        header: "Area ID",
      },
      {
        accessorKey: "ownerId",
        header: "Owner ID",
      },
      {
        accessorKey: "unitType",
        header: "Type",
        cell: ({ row }) => {
          const t: UnitType = row.getValue("unitType");
          return UNIT_TYPE_LABELS[t] || t;
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive: boolean = row.getValue("isActive");
          return (
            <Badge variant={isActive ? "success" : "neutral"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "basePricePerNight",
        header: "Price/night",
        cell: ({ row }) => {
          const price: number = row.getValue("basePricePerNight");
          return <span className="font-medium">{formatCurrency(price)}</span>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-end">Actions</div>,
        cell: ({ row }) => {
          const unit = row.original;
          return (
            <div className="flex items-center justify-end gap-2 text-end">
              {/* Detail view is viewable by all who can reach this page */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0"
                title="View details"
                onClick={() => router.push(ROUTES.admin.units.detail(unit.id))}
              >
                <Eye className="h-4 w-4 text-neutral-500" />
                <span className="sr-only">View</span>
              </Button>

              {canManageUnits && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 text-neutral-500"
                    title="Edit unit"
                    // Edit modal placeholder
                    onClick={() => console.log("TODO: Edit Unit", unit.id)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => onToggleStatus(unit)}
                    title={unit.isActive ? "Deactivate" : "Activate"}
                  >
                    {unit.isActive ? (
                      <PowerOff className="h-4 w-4 text-error" />
                    ) : (
                      <Power className="h-4 w-4 text-success" />
                    )}
                    <span className="sr-only">Toggle status</span>
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ];

    return cols;
  }, [canManageUnits, onToggleStatus, router]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
      emptyMessage="No matching units. Adjust the filters or clear the search."
    />
  );
}
