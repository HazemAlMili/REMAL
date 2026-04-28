import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AmenityResponse } from "@/lib/types";
import { Pencil, Power, PowerOff } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { EmptyState } from "@/components/ui/EmptyState";

interface AmenitiesTableProps {
  data: AmenityResponse[];
  onEdit: (amenity: AmenityResponse) => void;
  onToggleStatus: (amenity: AmenityResponse) => void;
}

export function AmenitiesTable({
  data,
  onEdit,
  onToggleStatus,
}: AmenitiesTableProps) {
  const { canManageAmenities } = usePermissions();

  if (!data?.length) {
    return (
      <EmptyState
        title="No amenities found"
        description="There are no amenities matching your search criteria."
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
              Icon
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Status
            </th>
            <th className="h-10 px-4 text-left font-medium text-neutral-500">
              Created At
            </th>
            {canManageAmenities && (
              <th className="h-10 w-[100px] px-4 text-right font-medium text-neutral-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {data.map((amenity) => (
            <tr
              key={amenity.id}
              className="transition-colors hover:bg-neutral-50"
            >
              <td className="p-4 font-medium">{amenity.name}</td>
              <td className="p-4 text-neutral-500">{amenity.icon || "—"}</td>
              <td className="p-4">
                <Badge variant={amenity.isActive ? "success" : "neutral"}>
                  {amenity.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="p-4 text-neutral-500">
                {format(new Date(amenity.createdAt), "MMM d, yyyy")}
              </td>
              {canManageAmenities && (
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => onEdit(amenity)}
                      title="Edit amenity"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => onToggleStatus(amenity)}
                      title={amenity.isActive ? "Deactivate" : "Activate"}
                    >
                      {amenity.isActive ? (
                        <PowerOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Power className="h-4 w-4 text-green-500" />
                      )}
                      <span className="sr-only">Toggle Status</span>
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
