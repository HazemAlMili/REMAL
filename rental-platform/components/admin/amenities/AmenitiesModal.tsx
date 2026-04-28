import { Modal } from "@/components/ui/Modal";
import { AmenityForm, AmenityFormValues } from "./AmenityForm";
import { AmenityResponse } from "@/lib/types";

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AmenityResponse | null;
  onSubmit: (data: AmenityFormValues) => Promise<void>;
  isLoading: boolean;
}

export function AmenitiesModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isLoading,
}: AmenitiesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Amenity" : "Create Amenity"}
    >
      <div className="mb-4 text-sm text-neutral-500">
        {initialData
          ? "Update the details for this amenity."
          : "Add a new amenity to group features across units."}
      </div>
      <AmenityForm
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
