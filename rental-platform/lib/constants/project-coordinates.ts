// ═══════════════════════════════════════════════════════════
// lib/constants/project-coordinates.ts
// Hardcoded coordinate mapping — project API has no lat/lng
// Update when new projects are added or projects are renamed
// ═══════════════════════════════════════════════════════════

// Key = project.id (UUID), Value = [longitude, latitude]
// These are approximate center coordinates for each project.
// Populated from seed data / admin-known project locations.

export const PROJECT_COORDINATES: Record<string, [number, number]> = {
  // Format: 'project-uuid': [longitude, latitude]
  // Example entries (replace UUIDs with real seed data IDs):
  // 'a1b2c3d4-...': [29.0007, 31.2019],   // Palm Hills
  // 'e5f6g7h8-...': [28.9469, 30.9171],   // Abraj Al Alamein
  // ⚠️ TODO: Populate with real project UUIDs from seed data
  // When backend seeds initial projects, update this mapping with:
  // 1. Real project IDs (UUIDs from database)
  // 2. Accurate coordinates for each project location
  // 3. Document project names in comments for maintainability
};

// Default center for Egypt
export const MAP_CENTER: [number, number] = [30.8025, 26.8206];
export const MAP_ZOOM = 5.5;

// Fallback: if project ID not in mapping, marker is not rendered
export function getProjectCoordinates(
  projectId: string
): [number, number] | null {
  return PROJECT_COORDINATES[projectId] ?? null;
}
