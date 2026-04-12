-- ============================================================================
-- Migration:   0006_create_owners (ROLLBACK)
-- Ticket:      DB-MD-06
-- Title:       Rollback — Create owners table
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ux_owners_email_not_null;
DROP INDEX IF EXISTS ux_owners_phone;

DROP TABLE IF EXISTS owners;
