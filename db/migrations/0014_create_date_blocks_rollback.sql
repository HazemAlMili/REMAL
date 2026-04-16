-- ============================================================================
-- Migration:   0014_create_date_blocks (ROLLBACK)
-- Ticket:      DB-UA-05
-- Title:       Rollback — Create date_blocks table
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_date_blocks_unit_id_date_range;
DROP INDEX IF EXISTS ix_date_blocks_unit_id;

DROP TABLE IF EXISTS date_blocks;
