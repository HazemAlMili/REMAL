-- ============================================================================
-- Migration:   0034_create_review_replies (ROLLBACK)
-- Ticket:      DB-RR-04
-- Title:       Rollback — Create review_replies table
-- Database:    PostgreSQL 16
-- Created:     2026-04-21
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_review_replies_is_visible;
DROP INDEX IF EXISTS ix_review_replies_owner_id;
DROP INDEX IF EXISTS ux_review_replies_review_id;

DROP TABLE IF EXISTS review_replies;
