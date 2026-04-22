-- ============================================================================
-- Migration:   0041_create_reporting_booking_daily_summary_view
-- Ticket:      DB-RA-02
-- Title:       Create reporting_booking_daily_summary SQL view for daily
--              booking creation and current-status distribution analytics
-- Database:    PostgreSQL 16
-- Depends on:  0016_create_bookings (bookings table)
--              0013_reports_analytics_db_scope decision (read-model-first freeze)
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes daily booking analytics grouped by
--   booking creation date and booking source. Provides stable aggregate counts
--   and total final amounts so that Data Access and API layers do not need to
--   reconstruct these aggregations independently.
--
-- VIEW CONTRACT (8 columns):
--   metric_date                DATE             — calendar day of booking creation
--   booking_source             VARCHAR          — bookings.source value
--   bookings_created_count     INT              — total bookings created on this day for this source
--   pending_bookings_count     INT              — bookings with current status = 'pending'
--   confirmed_bookings_count   INT              — bookings with current status = 'confirmed'
--   cancelled_bookings_count   INT              — bookings with current status = 'cancelled'
--   completed_bookings_count   INT              — bookings with current status = 'completed'
--   total_final_amount         DECIMAL(14,2)    — sum of final_amount for all bookings in this group
--
-- GROUPING:
--   One row per (DATE(bookings.created_at), bookings.source)
--
-- STATUS NOTE:
--   Status counts reflect the CURRENT booking_status at query time,
--   not the status at the time of creation. This is a current-state
--   distribution view, not a status-transition history view.
--
-- SCOPE RULES (per DB-RA-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ Source table: bookings only
--   ✓ No materialized view
--   ✗ No owner_id / unit_id / admin_user_id drilldown
--   ✗ No CRM / assignment fields
--   ✗ No check-in/check-out date analytics
--   ✗ No monthly / hourly rollups
--   ✗ No warehouse / fact / dimension tables
-- ============================================================================

CREATE OR REPLACE VIEW reporting_booking_daily_summary AS
SELECT
    DATE(b.created_at)                                              AS metric_date,
    b.source                                                        AS booking_source,
    COUNT(*)                                                        AS bookings_created_count,
    COUNT(*) FILTER (WHERE b.booking_status = 'pending')            AS pending_bookings_count,
    COUNT(*) FILTER (WHERE b.booking_status = 'confirmed')          AS confirmed_bookings_count,
    COUNT(*) FILTER (WHERE b.booking_status = 'cancelled')          AS cancelled_bookings_count,
    COUNT(*) FILTER (WHERE b.booking_status = 'completed')          AS completed_bookings_count,
    COALESCE(SUM(b.final_amount), 0)::DECIMAL(14,2)                 AS total_final_amount
FROM bookings b
GROUP BY
    DATE(b.created_at),
    b.source;

COMMENT ON VIEW reporting_booking_daily_summary IS
    'Reports & Analytics read model: daily booking creation counts and '
    'current-status distribution by booking source. '
    'Aggregate view — no owner/unit/admin drilldown. '
    'Source: bookings. Scope frozen per DB-RA-01.';
