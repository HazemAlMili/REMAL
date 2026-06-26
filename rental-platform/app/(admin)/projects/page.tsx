"use client";

import { useState } from "react";
import { Plus, MapPin, AlertCircle } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAreasList, useToggleAreaStatus } from "@/lib/hooks/useAreas";
import { AreaResponse } from "@/lib/types/area.types";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/utils/toast";

import { AreaTable } from "@/components/admin/areas/AreaTable";
import { AreaFormModal } from "@/components/admin/areas/AreaFormModal";

export default function AreasPage() {
  const { canManageAreas } = usePermissions();
  const { data: areas, isLoading, isError } = useAreasList(true);
  const toggleAreaStatus = useToggleAreaStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaResponse | undefined>();
  const [statusConfirmArea, setStatusConfirmArea] = useState<
    AreaResponse | undefined
  >();

  const handleCreate = () => {
    setEditingArea(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (area: AreaResponse) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleToggleStatusClick = (area: AreaResponse) => {
    setStatusConfirmArea(area);
  };

  const handleConfirmToggle = async () => {
    if (!statusConfirmArea) return;

    const newStatus = !statusConfirmArea.isActive;
    try {
      await toggleAreaStatus.mutateAsync({
        id: statusConfirmArea.id,
        data: { isActive: newStatus },
      });
      toastSuccess(newStatus ? "Area activated" : "Area deactivated");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not update area status");
    } finally {
      setStatusConfirmArea(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Could not load resort areas"
          description="We could not load resort areas. Retry the page before editing area setup."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Resort areas
          </h1>
          <p className="text-sm text-neutral-500">
            Manage the North Coast areas used for unit setup and client search.
          </p>
        </div>

        {canManageAreas && (
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create area
          </Button>
        )}
      </div>

      <div>
        {isLoading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : areas && areas.length > 0 ? (
          <AreaTable
            areas={areas}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatusClick}
          />
        ) : (
          <EmptyState
            icon={<MapPin className="h-10 w-10" />}
            title="Resort area catalog is empty"
            description="Create an area before assigning units to a resort or zone."
            action={
              canManageAreas ? (
                <Button
                  onClick={handleCreate}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create area
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      {isModalOpen && canManageAreas && (
        <AreaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          area={editingArea}
        />
      )}

      {statusConfirmArea && canManageAreas && (
        <ConfirmDialog
          isOpen={!!statusConfirmArea}
          onCancel={() => setStatusConfirmArea(undefined)}
          title={
            statusConfirmArea.isActive ? "Deactivate Area" : "Activate Area"
          }
          description={
            statusConfirmArea.isActive
              ? `Deactivate "${statusConfirmArea.name}"? Operators will not be able to assign new units to this area.`
              : `Activate "${statusConfirmArea.name}"? Operators can assign new units to this area again.`
          }
          confirmLabel={
            statusConfirmArea.isActive ? "Deactivate area" : "Activate area"
          }
          variant={statusConfirmArea.isActive ? "danger" : "primary"}
          onConfirm={handleConfirmToggle}
        />
      )}
    </div>
  );
}
