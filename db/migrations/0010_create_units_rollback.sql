-- ============================================================================
-- Migration:   0010_create_units (ROLLBACK)
-- Ticket:      DB-UA-01
-- Title:       Rollback — Create units table
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_units_area_id;
DROP INDEX IF EXISTS ix_units_owner_id;

DROP TABLE IF EXISTS units;
