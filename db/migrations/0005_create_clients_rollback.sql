-- ============================================================================
-- Migration:   0005_create_clients (ROLLBACK)
-- Ticket:      DB-MD-05
-- Title:       Rollback — Create clients table
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ux_clients_email_not_null;
DROP INDEX IF EXISTS ux_clients_phone;

DROP TABLE IF EXISTS clients;
