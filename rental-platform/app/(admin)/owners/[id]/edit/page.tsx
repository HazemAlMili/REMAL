"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOwner } from "@/lib/hooks/useOwners";
import { OwnerForm } from "@/components/admin/owners/OwnerForm";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface EditOwnerPageProps {
  params: { id: string };
}

export default function EditOwnerPage({ params }: EditOwnerPageProps) {
  const { id } = params;
  const { canManageOwners } = usePermissions();

  const { data: owner, isLoading, isError } = useOwner(id);

  if (!canManageOwners) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Access Denied"
          description="You do not have permission to edit owners. This feature is restricted to SuperAdmin users."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !owner) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Owner not found"
          description="The owner you are looking for does not exist or has been removed."
        />
      </div>
    );
  }

  const defaultValues = {
    id: owner.id,
    name: owner.name,
    phone: owner.phone,
    email: owner.email ?? undefined,
    commissionRate: owner.commissionRate,
    status: owner.status,
    notes: owner.notes ?? undefined,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Edit Owner
        </h1>
        <p className="text-sm text-neutral-500">
          Update owner information and settings.
        </p>
      </div>

      <div className="max-w-3xl">
        <OwnerForm mode="edit" defaultValues={defaultValues} />
      </div>
    </div>
  );
}
