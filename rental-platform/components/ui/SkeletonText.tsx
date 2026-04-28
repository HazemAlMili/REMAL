"use client";

import { Skeleton } from "./Skeleton";

export interface SkeletonTextProps {
  width?: string | number;
  className?: string;
}

export function SkeletonText({ width = "100%", className }: SkeletonTextProps) {
  return (
    <Skeleton width={width} height={14} rounded="full" className={className} />
  );
}
