-- ============================================================================
-- Migration:   0003_create_areas (ROLLBACK)
-- Ticket:      DB-MD-03
-- Title:       Rollback — Create areas table
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ux_areas_name;

DROP TABLE IF EXISTS areas;
