import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface LifecycleActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  isPending: boolean;
  onConfirm: (notes?: string) => void;
  requireNotes?: boolean;
}

export function LifecycleActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  isPending,
  onConfirm,
  requireNotes = false,
}: LifecycleActionDialogProps) {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    if (!isPending) {
      setNotes("");
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setNotes("");
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <div className="py-4 space-y-4">
        <p className="text-sm text-neutral-600">{description}</p>
        
        <div className="grid gap-2">
          <label htmlFor="notes" className="text-sm font-medium text-neutral-700">
            Notes {requireNotes ? "(Required)" : "(Optional)"}
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder="Add any internal notes about this status change..."
            className="resize-none"
            rows={3}
            disabled={isPending}
          />
        </div>
      </div>
      <ModalFooter>
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isPending || (requireNotes && !notes.trim())}
          >
            {isPending ? "Processing..." : actionLabel}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

