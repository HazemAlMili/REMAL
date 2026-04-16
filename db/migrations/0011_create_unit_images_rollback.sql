-- ============================================================================
-- Migration:   0011_create_unit_images (ROLLBACK)
-- Ticket:      DB-UA-02
-- Title:       Rollback — Create unit_images table
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_unit_images_unit_id_display_order;
DROP INDEX IF EXISTS ix_unit_images_unit_id;

DROP TABLE IF EXISTS unit_images;
