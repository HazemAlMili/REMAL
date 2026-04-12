-- ============================================================================
-- Migration:   0004_create_admin_users (ROLLBACK)
-- Ticket:      DB-MD-04
-- Title:       Rollback — Create admin_users table
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ux_admin_users_email;

-- CHECK constraint ck_admin_users_role is dropped automatically with the table
DROP TABLE IF EXISTS admin_users;
