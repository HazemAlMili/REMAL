-- ============================================================================
-- Rollback:    0045_reports_analytics_integrity_cleanup_rollback
-- Ticket:      DB-RA-06
-- Reverts:     0045_reports_analytics_integrity_cleanup.sql
-- ============================================================================
--
-- NOTE:
--   The up migration only re-stamped COMMENT ON VIEW. Rollback restores
--   the prior comment text from the original view migration.
-- ============================================================================

COMMENT ON VIEW reporting_booking_daily_summary IS
    'Reports & Analytics read model: daily booking creation counts and '
    'current-status distribution by booking source. '
    'Aggregate view — no owner/unit/admin drilldown. '
    'Source: bookings. Scope frozen per DB-RA-01.';

COMMENT ON VIEW reporting_finance_daily_summary IS
    'Reports & Analytics read model: daily finance summary by booking creation date. '
    'Covers invoiced/paid/remaining totals and payout bucket sums. '
    'Cancelled invoices and non-paid payments excluded. '
    'Source: bookings, invoices, payments, owner_payouts. Scope frozen per DB-RA-01.';

COMMENT ON VIEW reporting_reviews_daily_summary IS
    'Reports & Analytics read model: daily published-review counts, average rating, '
    'and owner-reply participation by publication date. '
    'Published reviews only — pending/rejected/hidden excluded. '
    'Source: reviews, review_replies. Scope frozen per DB-RA-01.';

COMMENT ON VIEW reporting_notifications_daily_summary IS
    'Reports & Analytics read model: daily notification lifecycle counts by channel. '
    'Current-status distribution only — no provider/webhook/campaign analytics. '
    'Source: notifications. Scope frozen per DB-RA-01.';
