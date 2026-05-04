"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { OwnerListFilters } from "@/lib/types/owner.types";

import { useOwners, useUpdateOwnerStatus } from "@/lib/hooks/useOwners";
import { OwnerFilters } from "@/components/admin/owners/OwnerFilters";
import { OwnerTable } from "@/components/admin/owners/OwnerTable";
import { ROUTES } from "@/lib/constants/routes";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default function OwnersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6">
          <SkeletonTable columns={6} rows={8} />
        </div>
      }
    >
      <OwnersPageContent />
    </React.Suspense>
  );
}

function OwnersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canManageOwners } = usePermissions();

  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const includeInactive = searchParams.get("includeInactive") === "true";

  const filters: OwnerListFilters = React.useMemo(
    () => ({
      includeInactive,
      page,
      pageSize,
    }),
    [includeInactive, page, pageSize]
  );

  const { data: paginatedOwners, isLoading, isError } = useOwners(filters);
  const { mutateAsync: updateStatus } = useUpdateOwnerStatus();

  // Status toggle confirmation
  const [statusConfirmOwner, setStatusConfirmOwner] = React.useState<
    { id: string; name: string; status: "active" | "inactive" } | undefined
  >();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    params.set("includeInactive", String(includeInactive));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: OwnerListFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.includeInactive !== undefined) {
      params.set("includeInactive", String(newFilters.includeInactive));
    } else {
      params.delete("includeInactive");
    }
    if (newFilters.page) params.set("page", String(newFilters.page));
    if (newFilters.pageSize)
      params.set("pageSize", String(newFilters.pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleStatusRequest = (owner: {
    id: string;
    name: string;
    status: "active" | "inactive";
  }) => {
    setStatusConfirmOwner(owner);
  };

  const confirmToggleStatus = async () => {
    if (!statusConfirmOwner) return;
    try {
      const newStatus =
        statusConfirmOwner.status === "active" ? "inactive" : "active";
      await updateStatus({
        id: statusConfirmOwner.id,
        status: newStatus,
      });
      toastSuccess(
        newStatus === "active" ? "Owner activated" : "Owner deactivated"
      );
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to update status");
    } finally {
      setStatusConfirmOwner(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Failed to load owners"
          description="There was an error loading the owners list. Please try again."
        />
      </div>
    );
  }

  // Handle total empty state correctly: no items across DB at all.
  // Because no filters are used except pagination, page 1 empty means everything empty
  const noOwnersAtAll =
    !isLoading && paginatedOwners?.pagination?.totalCount === 0 && page === 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Owners
          </h1>
          <p className="text-sm text-neutral-500">
            Manage property owners and their commission rates.
          </p>
        </div>
        {canManageOwners && (
          <Button onClick={() => router.push(ROUTES.admin.owners.create)}>
            <Plus className="mr-2 h-4 w-4" />
            New Owner
          </Button>
        )}
      </div>

      <OwnerFilters
        filters={filters}
        onChange={handleFilterChange}
        isLoading={isLoading}
      />

      {isLoading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : noOwnersAtAll ? (
        <EmptyState
          icon={<div className="h-10 w-10 text-neutral-400">🏠</div>}
          title="No owners yet"
          description="You haven't added any owners to your inventory."
          action={
            canManageOwners ? (
              <Button onClick={() => router.push(ROUTES.admin.owners.create)}>
                Add Owner
              </Button>
            ) : undefined
          }
        />
      ) : (
        <OwnerTable
          data={paginatedOwners?.items || []}
          pagination={
            paginatedOwners?.pagination || {
              page: 1,
              pageSize: 10,
              totalCount: 0,
              totalPages: 0,
            }
          }
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onToggleStatus={handleToggleStatusRequest}
        />
      )}

      {canManageOwners && (
        <ConfirmDialog
          isOpen={!!statusConfirmOwner}
          onCancel={() => setStatusConfirmOwner(undefined)}
          onConfirm={confirmToggleStatus}
          title={
            statusConfirmOwner?.status === "active"
              ? "Deactivate Owner"
              : "Activate Owner"
          }
          description={`Are you sure you want to ${
            statusConfirmOwner?.status === "active" ? "deactivate" : "activate"
          } the owner "${statusConfirmOwner?.name}"?`}
        />
      )}
    </div>
  );
}
