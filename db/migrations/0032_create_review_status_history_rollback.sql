-- ============================================================================
-- Migration:   0032_create_review_status_history (ROLLBACK)
-- Ticket:      DB-RR-02
-- Title:       Rollback — Create review_status_history table
-- Database:    PostgreSQL 16
-- Created:     2026-04-21
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_review_status_history_changed_by_admin_user_id;
DROP INDEX IF EXISTS ix_review_status_history_changed_at;
DROP INDEX IF EXISTS ix_review_status_history_review_id;

DROP TABLE IF EXISTS review_status_history;
