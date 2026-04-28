"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, AlertCircle, Building2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { UnitListItemResponse, UnitListFilters } from "@/lib/types";

import {
  useInternalUnitsList,
  useUpdateUnitStatus,
} from "@/lib/hooks/useUnits";
import { UnitFilters } from "@/components/admin/units/UnitFilters";
import { UnitTable } from "@/components/admin/units/UnitTable";
import { ROUTES } from "@/lib/constants/routes";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default function UnitsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6">
          <SkeletonTable columns={6} rows={8} />
        </div>
      }
    >
      <UnitsPageContent />
    </React.Suspense>
  );
}

function UnitsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canManageUnits } = usePermissions();

  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;

  const filters: UnitListFilters = React.useMemo(
    () => ({
      page,
      pageSize,
    }),
    [page, pageSize]
  );

  const {
    data: paginatedUnits,
    isLoading,
    isError,
  } = useInternalUnitsList(filters);
  const { mutateAsync: updateStatus } = useUpdateUnitStatus();

  // Status toggle confirmation
  const [statusConfirmUnit, setStatusConfirmUnit] = React.useState<
    UnitListItemResponse | undefined
  >();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: UnitListFilters) => {
    // Only keeping page and pageSize as documented
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.page) params.set("page", String(newFilters.page));
    if (newFilters.pageSize)
      params.set("pageSize", String(newFilters.pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleStatusRequest = (unit: UnitListItemResponse) => {
    setStatusConfirmUnit(unit);
  };

  const confirmToggleStatus = async () => {
    if (!statusConfirmUnit) return;
    try {
      const newStatus = !statusConfirmUnit.isActive;
      await updateStatus({
        id: statusConfirmUnit.id,
        isActive: newStatus,
      });
      toastSuccess(newStatus ? "Unit activated" : "Unit deactivated");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to update status");
    } finally {
      setStatusConfirmUnit(undefined);
    }
  };

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Failed to load units"
          description="There was an error loading the units inventory. Please try again."
        />
      </div>
    );
  }

  // Handle total empty state correctly: no items across DB at all.
  // Because no filters are used except pagination, page 1 empty means everything empty
  const noUnitsAtAll =
    !isLoading && paginatedUnits?.pagination.totalCount === 0 && page === 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Units
          </h1>
          <p className="text-sm text-neutral-500">
            Manage your property inventory and operations.
          </p>
        </div>
        {canManageUnits && (
          <Button onClick={() => router.push(ROUTES.admin.units.create)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        )}
      </div>

      <UnitFilters
        filters={filters}
        onChange={handleFilterChange}
        isLoading={isLoading}
      />

      {isLoading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : noUnitsAtAll ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-neutral-400" />}
          title="No units yet"
          description="You haven't added any units to your inventory."
          action={
            canManageUnits ? (
              <Button onClick={() => router.push(ROUTES.admin.units.create)}>
                Add Unit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <UnitTable
          data={paginatedUnits?.items || []}
          pagination={
            paginatedUnits?.pagination || {
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

      {canManageUnits && (
        <ConfirmDialog
          isOpen={!!statusConfirmUnit}
          onCancel={() => setStatusConfirmUnit(undefined)}
          onConfirm={confirmToggleStatus}
          title={
            statusConfirmUnit?.isActive ? "Deactivate Unit" : "Activate Unit"
          }
          description={`Are you sure you want to ${
            statusConfirmUnit?.isActive ? "deactivate" : "activate"
          } the unit "${statusConfirmUnit?.name}"?`}
        />
      )}
    </div>
  );
}
