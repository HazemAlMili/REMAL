-- ============================================================================
-- Migration:   0012_create_unit_amenities (ROLLBACK)
-- Ticket:      DB-UA-03
-- Title:       Rollback — Create unit_amenities join table
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_unit_amenities_amenity_id;

DROP TABLE IF EXISTS unit_amenities;
