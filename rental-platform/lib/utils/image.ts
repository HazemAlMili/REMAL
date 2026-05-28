// ═══════════════════════════════════════════════════════════
// lib/utils/image.ts
// Image URL utilities for cloud storage integration
// ═══════════════════════════════════════════════════════════

import type { UnitImageResponse } from "@/lib/types/unit.types";

const STORAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_STORAGE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).replace(/\/+$/, "");

/**
 * Builds full image URL from fileKey
 * @param fileKey - File key from API (e.g., "units/abc123/cover.jpg")
 * @returns Full URL or placeholder if fileKey is empty
 */
export function getImageUrl(fileKey: string): string;
export function getImageUrl(fileKey: null | undefined): null;
export function getImageUrl(fileKey: string | null | undefined): string | null {
  const normalizedFileKey = fileKey?.trim();
  if (!normalizedFileKey) return null;

  if (/^(https?:|data:|blob:)/i.test(normalizedFileKey)) {
    return normalizedFileKey;
  }

  if (normalizedFileKey.startsWith("/")) {
    if (normalizedFileKey.startsWith("/uploads/")) {
      return STORAGE_BASE_URL
        ? `${STORAGE_BASE_URL}${normalizedFileKey}`
        : normalizedFileKey;
    }

    return normalizedFileKey;
  }

  const uploadPath = normalizedFileKey.startsWith("uploads/")
    ? `/${normalizedFileKey}`
    : `/uploads/${normalizedFileKey}`;

  return STORAGE_BASE_URL ? `${STORAGE_BASE_URL}${uploadPath}` : uploadPath;
}

/**
 * Gets cover image URL from unit images array
 * Priority: cover image → first by displayOrder → placeholder
 * @param images - Array of unit images from API
 * @returns Full URL of cover image or placeholder
 */
export function getCoverImageUrl(
  images: UnitImageResponse[] | undefined
): string | null {
  if (!images || images.length === 0) return null;

  // Try to find cover image
  const cover = images.find((img) => img.isCover);
  if (cover) return getImageUrl(cover.fileKey);

  // Fall back to first image by displayOrder
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const firstImage = sorted[0];

  if (!firstImage) return null;

  return getImageUrl(firstImage.fileKey);
}
