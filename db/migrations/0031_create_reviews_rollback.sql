-- ============================================================================
-- Migration:   0031_create_reviews (ROLLBACK)
-- Ticket:      DB-RR-01
-- Title:       Rollback — Create reviews table
-- Database:    PostgreSQL 16
-- Created:     2026-04-21
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_reviews_published_at;
DROP INDEX IF EXISTS ix_reviews_status;
DROP INDEX IF EXISTS ix_reviews_client_id;
DROP INDEX IF EXISTS ix_reviews_owner_id;
DROP INDEX IF EXISTS ix_reviews_unit_id;
DROP INDEX IF EXISTS ux_reviews_booking_id;

DROP TABLE IF EXISTS reviews;
