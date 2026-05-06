"use client";

import * as React from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import { useUpdateClientStatus } from "@/lib/hooks/useClients";
import type { ClientDetailsResponse } from "@/lib/types/client.types";
import { UserCheck, UserX } from "lucide-react";

interface ClientDetailHeaderProps {
  client: ClientDetailsResponse;
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const updateStatus = useUpdateClientStatus(client.id);
  const nextIsActive = !client.isActive;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <StatusBadge
            status={client.isActive ? "active" : "inactive"}
            colorMap={{ active: "success", inactive: "neutral" }}
          />
        </div>
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
        <div>
          <span className="text-neutral-500">Registered</span>
          <p>{formatDate(client.createdAt)}</p>
        </div>
        <div>
          <span className="text-neutral-500">Last Updated</span>
          <p>{formatDate(client.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
