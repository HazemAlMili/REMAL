"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientListFilters } from "@/lib/types/client.types";

import { useClients } from "@/lib/hooks/useClients";
import { ClientTable } from "@/components/admin/clients/ClientTable";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export default function ClientsListPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6">
          <SkeletonTable columns={6} rows={8} />
        </div>
      }
    >
      <ClientsListPageContent />
    </React.Suspense>
  );
}

function ClientsListPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const includeInactive = searchParams.get("includeInactive") === "true";

  const filters: ClientListFilters = React.useMemo(
    () => ({
      includeInactive,
      page,
      pageSize,
    }),
    [includeInactive, page, pageSize]
  );

  const { data: paginatedClients, isLoading, isError } = useClients(filters);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    params.set("includeInactive", String(includeInactive));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: ClientListFilters) => {
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

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          title="Failed to load clients"
          description="There was an error loading the clients list. Please try again."
        />
      </div>
    );
  }

  // Handle total empty state correctly: no items across DB at all.
  // Because no filters are used except pagination, page 1 empty means everything empty
  const noClientsAtAll =
    !isLoading && paginatedClients?.pagination.totalCount === 0 && page === 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Clients
          </h1>
          <p className="text-sm text-neutral-500">
            Browse all registered clients.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) =>
              handleFilterChange({
                includeInactive: e.target.checked,
                page: 1,
                pageSize,
              })
            }
            className="rounded border-neutral-300"
          />
          Include inactive clients
        </label>
      </div>

      {isLoading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : noClientsAtAll ? (
        <EmptyState
          icon={<div className="h-10 w-10 text-neutral-400">👤</div>}
          title="No clients found"
          description="No clients match the current filters."
        />
      ) : (
        <ClientTable
          clients={paginatedClients?.items || []}
          isLoading={isLoading}
          pagination={
            paginatedClients?.pagination || {
              page: 1,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
            }
          }
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
