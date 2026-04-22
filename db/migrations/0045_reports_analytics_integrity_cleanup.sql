-- ============================================================================
-- Migration:   0045_reports_analytics_integrity_cleanup
-- Ticket:      DB-RA-06
-- Title:       Reports & Analytics schema/read-model integrity cleanup
--              and cross-view verification pass
-- Database:    PostgreSQL 16
-- Depends on:  0041_create_reporting_booking_daily_summary_view
--              0042_create_reporting_finance_daily_summary_view
--              0043_create_reporting_reviews_daily_summary_view
--              0044_create_reporting_notifications_daily_summary_view
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Quality-gate cleanup pass for the Reports & Analytics domain.
--   No new views, tables, or columns are introduced.
--   This migration is intentionally a no-op DDL pass — its value is in the
--   companion verify script (0045_..._verify.sql) which provides the
--   comprehensive cross-domain contract check.
--
-- CHECKLIST ENFORCED BY THIS TICKET:
--   1. decision note exists and matches implementation
--   2. reporting_booking_daily_summary — columns + no owner/unit/admin/CRM drift
--   3. reporting_finance_daily_summary — columns + paid-only + no-cancelled + no refund/tax
--   4. reporting_reviews_daily_summary — columns + published-only + no helpfulness/media/sentiment
--   5. reporting_notifications_daily_summary — columns + no provider/webhook/campaign/recipient
--   6. no warehouse/fact/dimension/staging tables in Reports & Analytics Tier 1
--   7. no materialized views in Reports & Analytics MVP
--
-- NOTE:
--   All verification is performed in the companion verify script.
--   This up migration contains only a recorded COMMENT to mark the cleanup
--   pass as applied.
-- ============================================================================

COMMENT ON VIEW reporting_booking_daily_summary IS
    'Reports & Analytics read model: daily booking creation counts and '
    'current-status distribution by booking source. '
    'Aggregate view — no owner/unit/admin drilldown. '
    'Source: bookings. Scope frozen per DB-RA-01. '
    'Integrity verified by DB-RA-06.';

COMMENT ON VIEW reporting_finance_daily_summary IS
    'Reports & Analytics read model: daily finance summary by booking creation date. '
    'Covers invoiced/paid/remaining totals and payout bucket sums. '
    'Cancelled invoices and non-paid payments excluded. '
    'Source: bookings, invoices, payments, owner_payouts. Scope frozen per DB-RA-01. '
    'Integrity verified by DB-RA-06.';

COMMENT ON VIEW reporting_reviews_daily_summary IS
    'Reports & Analytics read model: daily published-review counts, average rating, '
    'and owner-reply participation by publication date. '
    'Published reviews only — pending/rejected/hidden excluded. '
    'Source: reviews, review_replies. Scope frozen per DB-RA-01. '
    'Integrity verified by DB-RA-06.';

COMMENT ON VIEW reporting_notifications_daily_summary IS
    'Reports & Analytics read model: daily notification lifecycle counts by channel. '
    'Current-status distribution only — no provider/webhook/campaign analytics. '
    'Source: notifications. Scope frozen per DB-RA-01. '
    'Integrity verified by DB-RA-06.';
