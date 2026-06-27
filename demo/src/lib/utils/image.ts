import type { UnitImage } from "@/lib/api/types";

/**
 * Build a full image URL from a backend `fileKey`.
 * fileKey is a storage key (e.g. "units/abc/cover.jpg" or "/uploads/..."),
 * served by the API's static-file middleware under `/uploads`.
 * Mirrors rental-platform/lib/utils/image.ts.
 */
const STORAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_STORAGE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).replace(/\/+$/, "");

export function getImageUrl(fileKey: string | null | undefined): string | null {
  const normalized = fileKey?.trim();
  if (!normalized) return null;

  if (/^(https?:|data:|blob:)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    if (normalized.startsWith("/uploads/")) {
      return STORAGE_BASE_URL
        ? `${STORAGE_BASE_URL}${normalized}`
        : normalized;
    }
    return normalized;
  }

  const uploadPath = normalized.startsWith("uploads/")
    ? `/${normalized}`
    : `/uploads/${normalized}`;

  return STORAGE_BASE_URL ? `${STORAGE_BASE_URL}${uploadPath}` : uploadPath;
}

/** Cover image URL from a unit's images: cover → first by order → null. */
export function getCoverImageUrl(
  images: UnitImage[] | undefined
): string | null {
  if (!images || images.length === 0) return null;
  const cover = images.find((img) => img.isCover);
  if (cover) return getImageUrl(cover.fileKey);
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const first = sorted[0];
  return first ? getImageUrl(first.fileKey) : null;
}

/** All resolvable image URLs for a unit, cover first, in display order. */
export function getImageUrls(images: UnitImage[] | undefined): string[] {
  if (!images || images.length === 0) return [];
  return [...images]
    .sort((a, b) => {
      if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    })
    .map((img) => getImageUrl(img.fileKey))
    .filter((url): url is string => Boolean(url));
}
