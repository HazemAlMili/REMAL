// ═══════════════════════════════════════════════════════════
// lib/utils/image.ts
// Image URL utilities for cloud storage integration
// ═══════════════════════════════════════════════════════════

import type { UnitImageResponse } from "@/lib/types/unit.types";

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";

/**
 * Builds full image URL from fileKey
 * @param fileKey - File key from API (e.g., "units/abc123/cover.jpg")
 * @returns Full URL or placeholder if fileKey is empty
 */
export function getImageUrl(fileKey: string): string {
  if (!fileKey) return "/images/placeholder-unit.jpg";
  return `${STORAGE_BASE_URL}/${fileKey}`;
}

/**
 * Gets cover image URL from unit images array
 * Priority: cover image → first by displayOrder → placeholder
 * @param images - Array of unit images from API
 * @returns Full URL of cover image or placeholder
 */
export function getCoverImageUrl(
  images: UnitImageResponse[] | undefined
): string {
  if (!images || images.length === 0) return "/images/placeholder-unit.jpg";

  // Try to find cover image
  const cover = images.find((img) => img.isCover);
  if (cover) return getImageUrl(cover.fileKey);

  // Fall back to first image by displayOrder
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const firstImage = sorted[0];

  if (!firstImage) return "/images/placeholder-unit.jpg";

  return getImageUrl(firstImage.fileKey);
}
