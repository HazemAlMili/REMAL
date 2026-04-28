"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AreaResponse } from "@/lib/types/area.types";
import { Pencil, Power, PowerOff } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface AreaTableProps {
  areas: AreaResponse[];
  onEdit: (area: AreaResponse) => void;
  onToggleStatus: (area: AreaResponse) => void;
}

export function AreaTable({ areas, onEdit, onToggleStatus }: AreaTableProps) {
  const { canManageAreas } = usePermissions();

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50/50 border-b">
          <tr>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Name
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Description
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Status
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Created At
            </th>
            {canManageAreas && (
              <th className="h-10 w-[100px] px-4 text-right font-medium text-neutral-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {areas.map((area) => (
            <tr
              key={area.id}
              className={`hover:bg-neutral-50/50 ${!area.isActive ? "bg-neutral-50 opacity-60" : ""}`}
            >
              <td className="p-4 align-middle font-medium">{area.name}</td>
              <td
                className="max-w-[200px] truncate p-4 align-middle text-neutral-500"
                title={area.description}
              >
                {area.description || "-"}
              </td>
              <td className="p-4 align-middle">
                {area.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="neutral">Inactive</Badge>
                )}
              </td>
              <td className="p-4 align-middle text-neutral-500">
                {format(new Date(area.createdAt), "MMM d, yyyy")}
              </td>
              {canManageAreas && (
                <td className="flex items-center justify-end gap-2 p-4 text-right align-middle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(area)}
                    aria-label="Edit Area"
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(area)}
                    aria-label={
                      area.isActive ? "Deactivate Area" : "Activate Area"
                    }
                    className="h-8 w-8 p-0"
                  >
                    {area.isActive ? (
                      <PowerOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Power className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
