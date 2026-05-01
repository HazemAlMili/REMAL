"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { OwnerForm } from "@/components/admin/owners/OwnerForm";

export default function CreateOwnerPage() {
  const { canManageOwners } = usePermissions();

  if (!canManageOwners) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Access Denied"
          description="You do not have permission to create owners. This feature is restricted to SuperAdmin users."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Create Owner
        </h1>
        <p className="text-sm text-neutral-500">
          Add a new property owner to the system.
        </p>
      </div>

      <div className="max-w-3xl">
        <OwnerForm mode="create" />
      </div>
    </div>
  );
}
