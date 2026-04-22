-- ============================================================================
-- Migration:   0033_create_unit_review_summaries (ROLLBACK)
-- Ticket:      DB-RR-03
-- Title:       Rollback — Create unit_review_summaries table
-- Database:    PostgreSQL 16
-- Created:     2026-04-21
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_unit_review_summaries_last_review_published_at;

DROP TABLE IF EXISTS unit_review_summaries;
