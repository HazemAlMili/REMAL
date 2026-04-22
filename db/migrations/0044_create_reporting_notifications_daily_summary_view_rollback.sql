-- ============================================================================
-- Rollback:    0044_create_reporting_notifications_daily_summary_view_rollback
-- Ticket:      DB-RA-05
-- Reverts:     0044_create_reporting_notifications_daily_summary_view.sql
-- ============================================================================

DROP VIEW IF EXISTS reporting_notifications_daily_summary;
