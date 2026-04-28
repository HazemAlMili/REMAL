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
      toastError((e as Error)?.message || "Failed to toggle status");
    } finally {
      setStatusConfirmArea(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Failed to load areas"
          description="There was an error loading the areas list. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Areas</h1>
          <p className="text-muted-foreground">
            Manage geographical zones for rental units.
          </p>
        </div>

        {canManageAreas && (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Area
          </Button>
        )}
      </div>

      <div className="mt-8">
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
            title="No areas yet"
            description="Create your first area to start adding units."
            action={
              canManageAreas ? (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" /> Create Area
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
              ? `Are you sure you want to deactivate "${statusConfirmArea.name}"? This may affect unit creation.`
              : `Are you sure you want to activate "${statusConfirmArea.name}"? This allows new units to use it.`
          }
          onConfirm={handleConfirmToggle}
        />
      )}
    </div>
  );
}
