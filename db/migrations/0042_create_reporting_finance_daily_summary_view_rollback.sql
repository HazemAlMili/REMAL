-- ============================================================================
-- Rollback:    0042_create_reporting_finance_daily_summary_view_rollback
-- Ticket:      DB-RA-03
-- Reverts:     0042_create_reporting_finance_daily_summary_view.sql
-- ============================================================================

DROP VIEW IF EXISTS reporting_finance_daily_summary;
