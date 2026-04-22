-- ============================================================================
-- Rollback:    0043_create_reporting_reviews_daily_summary_view_rollback
-- Ticket:      DB-RA-04
-- Reverts:     0043_create_reporting_reviews_daily_summary_view.sql
-- ============================================================================

DROP VIEW IF EXISTS reporting_reviews_daily_summary;
