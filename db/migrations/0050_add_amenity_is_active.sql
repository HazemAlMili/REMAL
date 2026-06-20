-- ============================================================================
-- Migration:   0050_add_amenity_is_active
-- Title:       Add is_active flag to amenities
-- Database:    PostgreSQL 16
-- Depends on:  0002_create_amenities
-- Created:     2026-06-19
-- ============================================================================
--
-- PURPOSE:
--   Add an activation flag so admins can deactivate an amenity (hide it from
--   new unit setup) without deleting it. Backs the existing Amenities catalog
--   activate/deactivate toggle and the PATCH /api/amenities/{id}/status endpoint.
--
-- SCHEMA CONTRACT (added):
--   is_active   BOOLEAN NOT NULL DEFAULT true
--
-- NOTES:
--   ✓ Additive, non-breaking. Existing rows backfill to active (true).
--   ✓ Managed by EF Core via the application; no DB trigger.
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

ALTER TABLE amenities
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
