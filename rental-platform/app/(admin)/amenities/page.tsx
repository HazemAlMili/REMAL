"use client";

import { useState, useMemo } from "react";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAmenities } from "@/lib/hooks/useAmenities";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { AmenityResponse } from "@/lib/types";

import { AmenitiesTable } from "@/components/admin/amenities/AmenitiesTable";
import { AmenitiesModal } from "@/components/admin/amenities/AmenitiesModal";
import { AmenityFormValues } from "@/components/admin/amenities/AmenityForm";

export default function AmenitiesPage() {
  const { canManageAmenities } = usePermissions();
  const {
    amenities,
    isLoading,
    isError,
    createAmenity,
    updateAmenity,
    updateStatus,
  } = useAmenities();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] =
    useState<AmenityResponse | null>(null);

  // Status toggle confirmation
  const [statusConfirmAmenity, setStatusConfirmAmenity] = useState<
    AmenityResponse | undefined
  >();

  const filteredAmenities = useMemo(() => {
    if (!searchQuery.trim() || !amenities) return amenities || [];
    const lowerQuery = searchQuery.toLowerCase();
    return amenities.filter((a: AmenityResponse) => a.name.toLowerCase().includes(lowerQuery));
  }, [amenities, searchQuery]);

  // --- Handlers ---
  const handleAdd = () => {
    setSelectedAmenity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (amenity: AmenityResponse) => {
    setSelectedAmenity(amenity);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: AmenityFormValues) => {
    try {
      if (selectedAmenity) {
        await updateAmenity({ id: selectedAmenity.id, data });
        toastSuccess("Amenity updated");
      } else {
        await createAmenity(data);
        toastSuccess("Amenity created");
      }
      setIsModalOpen(false);
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not save amenity");
    }
  };

  const handleToggleStatusRequest = (amenity: AmenityResponse) => {
    setStatusConfirmAmenity(amenity);
  };

  const confirmToggleStatus = async () => {
    if (!statusConfirmAmenity) return;
    try {
      const newStatus = !statusConfirmAmenity.isActive;
      await updateStatus({
        id: statusConfirmAmenity.id,
        data: { isActive: newStatus },
      });
      toastSuccess(newStatus ? "Amenity activated" : "Amenity deactivated");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not update amenity status");
    } finally {
      setStatusConfirmAmenity(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Could not load amenities"
          description="We could not load the amenity catalog. Retry before editing unit amenities."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Amenities catalog
          </h1>
          <p className="text-sm text-neutral-500">
            Manage the amenity options operators can attach to units.
          </p>
        </div>
        {canManageAmenities && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create amenity
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search amenity name"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable columns={4} rows={5} />
      ) : (
        <AmenitiesTable
          data={filteredAmenities}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatusRequest}
        />
      )}

      {canManageAmenities && (
        <>
          <AmenitiesModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={selectedAmenity}
            onSubmit={handleSubmit}
            isLoading={false}
          />

          <ConfirmDialog
            isOpen={!!statusConfirmAmenity}
            onCancel={() => setStatusConfirmAmenity(undefined)}
            onConfirm={confirmToggleStatus}
            title={
              statusConfirmAmenity?.isActive
                ? "Deactivate Amenity"
                : "Activate Amenity"
            }
            description={
              statusConfirmAmenity?.isActive
                ? `Deactivate "${statusConfirmAmenity?.name}"? Operators will not be able to use it for new unit setup.`
                : `Activate "${statusConfirmAmenity?.name}"? Operators can use it for unit setup again.`
            }
            confirmLabel={
              statusConfirmAmenity?.isActive
                ? "Deactivate amenity"
                : "Activate amenity"
            }
            variant={statusConfirmAmenity?.isActive ? "danger" : "primary"}
          />
        </>
      )}
    </div>
  );
}
