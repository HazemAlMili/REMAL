// ═══════════════════════════════════════════════════════════
// lib/constants/area-coordinates.ts
// Hardcoded coordinate mapping — area API has no lat/lng
// Update when new areas are added or areas are renamed
// ═══════════════════════════════════════════════════════════

// Key = area.id (UUID), Value = [longitude, latitude]
// These are approximate center coordinates for each area.
// Populated from seed data / admin-known area locations.

export const AREA_COORDINATES: Record<string, [number, number]> = {
  // Format: 'area-uuid': [longitude, latitude]
  // Example entries (replace UUIDs with real seed data IDs):
  // 'a1b2c3d4-...': [29.0007, 31.2019],   // Palm Hills
  // 'e5f6g7h8-...': [28.9469, 30.9171],   // Abraj Al Alamein
  // ⚠️ TODO: Populate with real area UUIDs from seed data
  // When backend seeds initial areas, update this mapping with:
  // 1. Real area IDs (UUIDs from database)
  // 2. Accurate coordinates for each area location
  // 3. Document area names in comments for maintainability
};

// Default center for Egypt
export const MAP_CENTER: [number, number] = [30.8025, 26.8206];
export const MAP_ZOOM = 5.5;

// Fallback: if area ID not in mapping, marker is not rendered
export function getAreaCoordinates(areaId: string): [number, number] | null {
  return AREA_COORDINATES[areaId] ?? null;
}
