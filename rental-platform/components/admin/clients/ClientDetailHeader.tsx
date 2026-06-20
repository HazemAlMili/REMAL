"use client";

import * as React from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import { useUpdateClientStatus } from "@/lib/hooks/useClients";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ClientPasswordResetDialog } from "./ClientPasswordResetDialog";
import type { ClientDetailsResponse } from "@/lib/types/client.types";
import { KeyRound, UserCheck, UserX } from "lucide-react";

interface ClientDetailHeaderProps {
  client: ClientDetailsResponse;
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const updateStatus = useUpdateClientStatus(client.id);
  const { canManageClients, canResetClientPasswords } = usePermissions();
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const nextIsActive = !client.isActive;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            {client.name}
          </h1>
          <StatusBadge
            status={client.isActive ? "active" : "inactive"}
            label={client.isActive ? "Active" : "Inactive"}
            colorMap={{ active: "success", inactive: "neutral" }}
          />
        </div>
        {(canManageClients || canResetClientPasswords) && (
          <div className="flex flex-wrap gap-2">
            {canResetClientPasswords && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<KeyRound className="h-4 w-4" />}
                onClick={() => setShowPasswordDialog(true)}
              >
                Reset password
              </Button>
            )}
            {canManageClients && (
              <Button
                variant={client.isActive ? "outline" : "success"}
                size="sm"
                leftIcon={
                  client.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )
                }
                isLoading={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ isActive: nextIsActive })}
              >
                {client.isActive ? "Deactivate" : "Reactivate"}
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-neutral-500">Phone</span>
          <p className="font-medium">{client.phone}</p>
        </div>
        <div>
          <span className="text-neutral-500">Email</span>
          <p className="font-medium">{client.email ?? "Not provided"}</p>
        </div>
        <div className="col-span-2">
          <span className="text-neutral-500">Client ID</span>
          <p className="font-mono text-xs text-neutral-700 break-all select-all">{client.id}</p>
        </div>
        <div>
          <span className="text-neutral-500">Registered</span>
          <p>{formatDate(client.createdAt)}</p>
        </div>
        <div>
          <span className="text-neutral-500">Last Updated</span>
          <p>{formatDate(client.updatedAt)}</p>
        </div>
      </div>
      <ClientPasswordResetDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        clientId={client.id}
      />
    </div>
  );
}
