import React from 'react';
import { cn } from '@/lib/utils/cn';

// Base shimmer skeleton block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[length:200%_100%] animate-shimmer',
        'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100',
        className
      )}
    />
  );
}

// Property card skeleton (matches the UnitCard layout)
export function UnitCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[1.5rem] overflow-hidden bg-white border border-gray-100">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[4/3] rounded-none rounded-t-[1.5rem]" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        {/* Subtitle */}
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Grid of property card skeletons
export function UnitGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <UnitCardSkeleton key={i} />
      ))}
    </div>
  );
}

// PDP Gallery skeleton
export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2 h-[500px] rounded-[2rem] overflow-hidden">
      <div className="col-span-2">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="flex-1 rounded-none" />
        <Skeleton className="flex-1 rounded-none" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="flex-1 rounded-none" />
        <Skeleton className="flex-1 rounded-none" />
      </div>
    </div>
  );
}

// Admin KPI card skeleton
export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-5">
        <Skeleton className="w-11 h-11 rounded-2xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24 rounded-lg mb-2" />
      <Skeleton className="h-3 w-16 rounded-lg mb-4" />
      <Skeleton className="h-7 w-32 rounded-lg" />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={`h-4 rounded-lg ${i === 0 ? 'w-40' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}
