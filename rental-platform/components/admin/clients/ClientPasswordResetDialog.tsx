"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useResetClientPassword } from "@/lib/hooks/useClients";

interface ClientPasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function ClientPasswordResetDialog({
  isOpen,
  onClose,
  clientId,
}: ClientPasswordResetDialogProps) {
  const resetMutation = useResetClientPassword(clientId);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    newPassword.length >= 8 && passwordsMatch && !resetMutation.isPending;

  const generatePassword = () => {
    const alphabet =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    const bytes = new Uint32Array(14);
    window.crypto.getRandomValues(bytes);
    const password = Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");

    setNewPassword(password);
    setConfirmPassword(password);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    resetMutation.mutate(
      { newPassword },
      {
        onSuccess: onClose,
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset client password" size="md">
      <form onSubmit={submit} className="space-y-4 py-4">
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={generatePassword}>
            Generate password
          </Button>
        </div>

        <Input
          label="New password"
          type="text"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={
            newPassword && newPassword.length < 8
              ? "Password must be at least 8 characters."
              : undefined
          }
          disabled={resetMutation.isPending}
          required
        />

        <Input
          label="Confirm password"
          type="text"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={
            confirmPassword && !passwordsMatch
              ? "Passwords do not match."
              : undefined
          }
          disabled={resetMutation.isPending}
          required
        />

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={resetMutation.isPending}
            disabled={!canSubmit}
          >
            Reset password
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
