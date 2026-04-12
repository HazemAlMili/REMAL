-- ============================================================================
-- Migration:   0002_create_amenities (ROLLBACK)
-- Ticket:      DB-MD-02
-- Title:       Rollback — Create amenities table
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

-- Drop unique index first (will be dropped with table, but explicit is cleaner)
DROP INDEX IF EXISTS ux_amenities_name;

-- Drop the amenities table
DROP TABLE IF EXISTS amenities;
