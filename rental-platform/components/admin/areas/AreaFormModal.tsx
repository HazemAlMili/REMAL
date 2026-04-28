"use client";

import { Modal } from "@/components/ui/Modal";
import { AreaForm, AreaFormValues } from "./AreaForm";
import { AreaResponse } from "@/lib/types/area.types";
import { useCreateArea, useUpdateArea } from "@/lib/hooks/useAreas";
import { toastSuccess, toastError } from "@/lib/utils/toast";

export interface AreaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  area?: AreaResponse;
}

export function AreaFormModal({ isOpen, onClose, area }: AreaFormModalProps) {
  const isEditing = !!area;

  const createArea = useCreateArea();
  const updateArea = useUpdateArea();

  const isLoading = createArea.isPending || updateArea.isPending;

  const handleSubmit = async (data: AreaFormValues) => {
    try {
      if (isEditing && area) {
        await updateArea.mutateAsync({ id: area.id, data });
        toastSuccess("Area updated successfully");
      } else {
        await createArea.mutateAsync(data);
        toastSuccess("Area created successfully");
      }
      onClose();
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "Failed to save area";
      toastError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Area" : "New Area"}
    >
      <div className="mb-4">
        <p className="text-sm text-neutral-500">
          {isEditing
            ? "Update the details for this area."
            : "Create a new area zone."}
        </p>
      </div>
      <AreaForm
        defaultValues={
          area ? { name: area.name, description: area.description } : {}
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
