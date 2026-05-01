// ═══════════════════════════════════════════════════════════
// app/(public)/units/page.tsx
// Main units listing page — URL-driven filters + pagination
// ═══════════════════════════════════════════════════════════

"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { usePublicUnits } from "@/lib/hooks/usePublic";
import { UnitCard } from "@/components/public/cards/UnitCard";
import { UnitFilters } from "@/components/public/search/UnitFilters";
import { SortSelect } from "@/components/public/search/SortSelect";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Filter, X } from "lucide-react";
import type { PublicUnitFilters } from "@/lib/types/public.types";

function filtersFromSearchParams(params: URLSearchParams): PublicUnitFilters {
  return {
    page: Number(params.get("page")) || 1,
    pageSize: 12,
    areaId: params.get("areaId") || undefined,
    unitType: params.get("unitType") || undefined,
    minGuests: Number(params.get("minGuests")) || undefined,
    minPrice: Number(params.get("minPrice")) || undefined,
    maxPrice: Number(params.get("maxPrice")) || undefined,
    sortBy: (params.get("sortBy") as PublicUnitFilters["sortBy"]) || undefined,
    search: params.get("search") || undefined,
  };
}

function updateUrlWithFilters(
  router: ReturnType<typeof useRouter>,
  filters: Partial<PublicUnitFilters>
) {
  const params = new URLSearchParams();
  // Only append non-default values to keep URLs clean
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== "" &&
      value !== 1 &&
      value !== 0 &&
      value !== 12
    ) {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  router.push(queryString ? `/units?${queryString}` : "/units");
}

function UnitsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive filters from URL — single source of truth
  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );

  // Fetch units
  const { data, isLoading } = usePublicUnits(filters);

  const units = data?.items ?? [];
  const pagination = data?.pagination ?? {
    totalCount: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
  };

  // Update URL on filter change
  const handleFilterChange = (updates: Partial<PublicUnitFilters>) => {
    const newFilters = { ...filters, ...updates };
    updateUrlWithFilters(router, newFilters);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    router.push("/units");
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  // Result count display
  const resultStart = (pagination.page - 1) * pagination.pageSize + 1;
  const resultEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalCount
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-container px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900 lg:text-4xl">
            Explore Properties
          </h1>
          {!isLoading && pagination.totalCount > 0 && (
            <p className="mt-2 text-neutral-600">
              Showing {resultStart}–{resultEnd} of {pagination.totalCount}{" "}
              properties
            </p>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters — Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Filters
              </h2>
              <UnitFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort + Mobile Filter Button */}
            <div className="mb-6 flex items-center justify-between">
              <div className="w-48">
                <SortSelect
                  value={filters.sortBy || ""}
                  onChange={(value) =>
                    handleFilterChange({
                      sortBy: (value ||
                        undefined) as PublicUnitFilters["sortBy"],
                      page: 1,
                    })
                  }
                />
              </div>
              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="md"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[320px] rounded-2xl" />
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && units.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {units.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && units.length === 0 && (
              <EmptyState
                title="No properties match your filters"
                description="Try adjusting your search criteria or clear all filters."
                action={
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                }
              />
            )}

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination meta={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 hover:bg-neutral-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <UnitFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50">
          <div className="mx-auto max-w-container px-6 py-8">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-neutral-900 lg:text-4xl">
                Explore Properties
              </h1>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[320px] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <UnitsPageContent />
    </Suspense>
  );
}
