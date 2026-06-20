-- ============================================================================
-- Rollback:    0050_add_amenity_is_active
-- Title:       Drop is_active flag from amenities
-- Database:    PostgreSQL 16
-- ============================================================================

ALTER TABLE amenities
    DROP COLUMN IF EXISTS is_active;
