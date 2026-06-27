"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, AlertCircle, Building2, ShieldAlert } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { ApiError } from "@/lib/api/api-error";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { UnitListItemResponse, UnitListFilters } from "@/lib/types";

import {
  useInternalUnitsList,
  useUpdateUnitPortfolioVisibility,
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
          <SkeletonTable columns={7} rows={8} />
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
  const projectId = searchParams.get("projectId") || undefined;
  const unitType = (searchParams.get("unitType") ||
    undefined) as UnitListFilters["unitType"];
  const amenityId = searchParams.get("amenityId") || undefined;
  const status = searchParams.get("isActive");
  const isActive =
    status === "true" ? true : status === "false" ? false : undefined;
  const search = searchParams.get("search") || undefined;

  const filters: UnitListFilters = React.useMemo(
    () => ({
      page,
      pageSize,
      projectId,
      unitType,
      amenityId,
      isActive,
      search,
    }),
    [amenityId, projectId, isActive, page, pageSize, search, unitType]
  );

  const {
    data: paginatedUnits,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInternalUnitsList(filters);
  const { mutateAsync: updateStatus } = useUpdateUnitStatus();
  const { mutateAsync: updatePortfolioVisibility } =
    useUpdateUnitPortfolioVisibility();

  // Status toggle confirmation
  const [statusConfirmUnit, setStatusConfirmUnit] = React.useState<
    UnitListItemResponse | undefined
  >();
  const [portfolioVisibilityUpdatingId, setPortfolioVisibilityUpdatingId] =
    React.useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = React.useCallback(
    (newFilters: UnitListFilters) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newFilters.page ?? DEFAULT_PAGE));
      params.set("pageSize", String(newFilters.pageSize ?? pageSize));

      const filterKeys: Array<keyof UnitListFilters> = [
        "projectId",
        "unitType",
        "amenityId",
        "search",
      ];
      for (const key of filterKeys) {
        const value = newFilters[key];
        if (value) params.set(key, String(value));
        else params.delete(key);
      }

      if (typeof newFilters.isActive === "boolean") {
        params.set("isActive", String(newFilters.isActive));
      } else {
        params.delete("isActive");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pageSize, pathname, router, searchParams]
  );

  const handleToggleStatusRequest = (unit: UnitListItemResponse) => {
    setStatusConfirmUnit(unit);
  };

  const handleTogglePortfolioVisibility = async (
    unit: UnitListItemResponse,
    isVisibleInPortfolio: boolean
  ) => {
    if (!canManageUnits) return;

    setPortfolioVisibilityUpdatingId(unit.id);
    try {
      await updatePortfolioVisibility({
        id: unit.id,
        isVisibleInPortfolio,
      });
      toastSuccess(
        isVisibleInPortfolio
          ? "Unit added to public portfolio"
          : "Unit hidden from public portfolio"
      );
    } catch (e: unknown) {
      toastError(
        (e as Error)?.message || "Could not update portfolio visibility"
      );
    } finally {
      setPortfolioVisibilityUpdatingId(null);
    }
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
      toastError((e as Error)?.message || "Could not update unit status");
    } finally {
      setStatusConfirmUnit(undefined);
    }
  };

  if (isError) {
    const isForbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="p-6">
        <EmptyState
          icon={
            isForbidden ? (
              <ShieldAlert className="h-10 w-10 text-neutral-400" />
            ) : (
              <AlertCircle className="h-10 w-10 text-red-500" />
            )
          }
          title={isForbidden ? "Access restricted" : "Could not load units"}
          description={
            isForbidden
              ? "Your signed-in account does not have access to unit inventory. Switch to an account with unit access, or ask a super admin to grant it."
              : "We could not load unit inventory. Retry the page or check your filters."
          }
        />
      </div>
    );
  }

  const hasFilters = Boolean(
    projectId ||
    unitType ||
    amenityId ||
    typeof isActive === "boolean" ||
    search
  );
  const noUnitsAtAll =
    !isLoading &&
    paginatedUnits?.pagination?.totalCount === 0 &&
    page === 1 &&
    !hasFilters;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Units
          </h1>
          <p className="text-sm text-neutral-500">
            Manage rentable units, active status, availability, images, and
            amenities.
          </p>
        </div>

        {canManageUnits && (
          <Button
            onClick={() => router.push(ROUTES.admin.units.create)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create unit
          </Button>
        )}
      </div>

      <UnitFilters
        filters={filters}
        onChange={handleFilterChange}
        isFetching={isFetching}
      />

      {isLoading ? (
        <SkeletonTable columns={7} rows={8} />
      ) : noUnitsAtAll ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-neutral-400" />}
          title="Unit inventory is empty"
          description="Create the first unit before adding images, amenities, seasonal pricing, or availability blocks."
          action={
            canManageUnits ? (
              <Button onClick={() => router.push(ROUTES.admin.units.create)}>
                Create unit
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
          onTogglePortfolioVisibility={handleTogglePortfolioVisibility}
          portfolioVisibilityUpdatingId={portfolioVisibilityUpdatingId}
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
          description={
            statusConfirmUnit?.isActive
              ? `Deactivate "${statusConfirmUnit?.name}"? It will be unavailable for public and internal booking workflows.`
              : `Activate "${statusConfirmUnit?.name}"? It becomes operational internally; public visibility still follows the portfolio switch.`
          }
          confirmLabel={
            statusConfirmUnit?.isActive ? "Deactivate unit" : "Activate unit"
          }
          variant={statusConfirmUnit?.isActive ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
