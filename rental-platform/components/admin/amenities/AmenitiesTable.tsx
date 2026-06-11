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
        title="No matching amenities"
        description="No amenities match this search. Clear the search or create a new amenity."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--portal-radius-card)] border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Name
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Icon
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Status
            </th>
            <th className="h-9 px-4 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Created
            </th>
            {canManageAmenities && (
              <th className="h-9 w-[100px] px-4 text-end text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {data.map((amenity) => (
            <tr
              key={amenity.id}
              className="transition-colors hover:bg-neutral-50"
            >
              <td className="px-4 py-2.5 font-medium">{amenity.name}</td>
              <td className="px-4 py-2.5 text-neutral-500">{amenity.icon || "—"}</td>
              <td className="px-4 py-2.5">
                <Badge variant={amenity.isActive ? "success" : "neutral"}>
                  {amenity.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-2.5 tabular-nums text-neutral-500">
                {format(new Date(amenity.createdAt), "MMM d, yyyy")}
              </td>
              {canManageAmenities && (
                <td className="px-4 py-2.5 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => onEdit(amenity)}
                      title="Edit amenity"
                      aria-label={`Edit ${amenity.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => onToggleStatus(amenity)}
                      title={
                        amenity.isActive
                          ? `Deactivate ${amenity.name}`
                          : `Activate ${amenity.name}`
                      }
                      aria-label={
                        amenity.isActive
                          ? `Deactivate ${amenity.name}`
                          : `Activate ${amenity.name}`
                      }
                    >
                      {amenity.isActive ? (
                        <PowerOff className="h-4 w-4 text-error" />
                      ) : (
                        <Power className="h-4 w-4 text-success" />
                      )}
                      <span className="sr-only">
                        {amenity.isActive ? "Deactivate" : "Activate"}{" "}
                        {amenity.name}
                      </span>
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
