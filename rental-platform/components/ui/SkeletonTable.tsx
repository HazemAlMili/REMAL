"use client";

import { Skeleton } from "./Skeleton";

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div
        className="grid gap-3 border-b border-neutral-200 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height={14} rounded="full" className="w-3/4" />
        ))}
      </div>

      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                height={14}
                rounded="full"
                className={colIndex === 0 ? "w-full" : "w-5/6"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
