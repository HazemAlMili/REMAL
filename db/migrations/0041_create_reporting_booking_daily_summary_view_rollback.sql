-- ============================================================================
-- Rollback:    0041_create_reporting_booking_daily_summary_view_rollback
-- Ticket:      DB-RA-02
-- Reverts:     0041_create_reporting_booking_daily_summary_view.sql
-- ============================================================================

DROP VIEW IF EXISTS reporting_booking_daily_summary;
