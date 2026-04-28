"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SkeletonTable } from "./SkeletonTable";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { cn } from "@/lib/utils/cn";
import type { PaginationMeta } from "@/lib/api/types";

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <SkeletonTable rows={5} columns={Math.max(columns.length, 1)} />;
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyMessage}
        description="There is nothing to display yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600",
                        isSortable &&
                          "cursor-pointer select-none transition-colors hover:bg-neutral-100"
                      )}
                      onClick={
                        isSortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <span className="inline-flex items-center text-neutral-400">
                            {sortDirection === "asc" && (
                              <ChevronUp
                                size={14}
                                className="text-neutral-700"
                              />
                            )}
                            {sortDirection === "desc" && (
                              <ChevronDown
                                size={14}
                                className="text-neutral-700"
                              />
                            )}
                            {!sortDirection && (
                              <ChevronUp
                                size={14}
                                className="opacity-0 group-hover:opacity-50"
                              />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors duration-150 hover:bg-neutral-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-neutral-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <Pagination meta={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
