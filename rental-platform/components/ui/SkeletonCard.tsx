"use client";

import { Skeleton } from "./Skeleton";

export interface SkeletonCardProps {
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  showImage = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      {showImage && (
        <Skeleton height={180} rounded="lg" className="mb-4 w-full" />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            height={14}
            rounded="full"
            className={index === lines - 1 ? "w-2/3" : "w-full"}
          />
        ))}
      </div>
    </div>
  );
}
