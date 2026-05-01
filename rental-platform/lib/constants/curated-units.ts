// ═══════════════════════════════════════════════════════════
// lib/constants/curated-units.ts
// Curated unit IDs for testimonials carousel
// Update with real UUIDs from seed data after initial setup
// ═══════════════════════════════════════════════════════════

// These units are known to have published reviews in seed data.
// The testimonials section fetches reviews for each of these units.
// Replace placeholder UUIDs with real seed data IDs.

export const TESTIMONIAL_UNIT_IDS: string[] = [
  // 'uuid-1',   // e.g., Villa Sunset — known to have 5-star review
  // 'uuid-2',   // e.g., Chalet Blue — known to have positive reviews
  // 'uuid-3',   // e.g., Studio Marina — known to have reviews
  // 'uuid-4',   // e.g., Villa Coral — backup
];

// Maximum reviews to take per unit (to avoid one unit dominating the carousel)
export const MAX_REVIEWS_PER_UNIT = 2;
