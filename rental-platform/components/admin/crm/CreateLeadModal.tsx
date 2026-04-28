"use client";

import { Modal } from "@/components/ui/Modal";
import { CreateLeadForm } from "./CreateLeadForm";
import { useCreateLead } from "@/lib/hooks/useCrm";
import type { CreateCrmLeadRequest } from "@/lib/types/crm.types";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const createMutation = useCreateLead();

  const handleSubmit = (data: CreateCrmLeadRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Lead" size="lg">
      <CreateLeadForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isPending}
      />
    </Modal>
  );
}
