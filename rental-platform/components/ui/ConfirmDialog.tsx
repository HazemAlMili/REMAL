"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  variant?: "primary" | "danger" | "secondary";
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  onClose,
  isLoading,
  confirmLabel = "Confirm",
  variant = "primary",
  children,
}: ConfirmDialogProps) {
  const handleCancel = onCancel || onClose;
  
  return (
    <Modal isOpen={isOpen} onClose={handleCancel!} title={title}>
      {description && <p className="text-sm text-neutral-600 mb-4">{description}</p>}
      {children}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
