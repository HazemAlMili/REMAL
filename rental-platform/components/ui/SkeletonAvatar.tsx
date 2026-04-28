"use client";

import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils/cn";

export interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<SkeletonAvatarProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function SkeletonAvatar({
  size = "md",
  className,
}: SkeletonAvatarProps) {
  const pixels = sizeMap[size];
  return (
    <Skeleton
      width={pixels}
      height={pixels}
      rounded="full"
      className={cn(className)}
    />
  );
}
