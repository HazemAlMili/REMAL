-- ============================================================================
-- Migration:   0042_create_reporting_finance_daily_summary_view
-- Ticket:      DB-RA-03
-- Title:       Create reporting_finance_daily_summary SQL view for daily
--              booking-based finance analytics
-- Database:    PostgreSQL 16
-- Depends on:  0016_create_bookings     (bookings table)
--              0022_create_payments     (payments table)
--              0023_create_invoices     (invoices table)
--              0025_create_owner_payouts (owner_payouts table)
--              0013_reports_analytics_db_scope decision (read-model-first freeze)
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes daily finance analytics grouped by
--   booking creation date. Provides invoiced/paid/remaining totals and
--   payout bucket sums so that Data Access and API layers do not need to
--   reconstruct these finance aggregations independently.
--
-- VIEW CONTRACT (8 columns):
--   metric_date                    DATE             — calendar day of booking creation
--   bookings_with_invoice_count    INT              — distinct bookings with a non-cancelled invoice
--   total_invoiced_amount          DECIMAL(14,2)    — sum of invoice total_amount (non-cancelled)
--   total_paid_amount              DECIMAL(14,2)    — sum of payments.amount where payment_status = 'paid'
--   total_remaining_amount         DECIMAL(14,2)    — total_invoiced_amount - total_paid_amount
--   total_pending_payout_amount    DECIMAL(14,2)    — sum of payout_amount where payout_status = 'pending'
--   total_scheduled_payout_amount  DECIMAL(14,2)    — sum of payout_amount where payout_status = 'scheduled'
--   total_paid_payout_amount       DECIMAL(14,2)    — sum of payout_amount where payout_status = 'paid'
--
-- GROUPING:
--   One row per DATE(bookings.created_at)
--
-- JOIN LOGIC:
--   FROM bookings
--   LEFT JOIN invoices   ON invoices.booking_id = bookings.id
--                       AND invoices.invoice_status <> 'cancelled'
--   LEFT JOIN owner_payouts ON owner_payouts.booking_id = bookings.id
--   paid_amount = correlated subquery: SUM(payments.amount)
--                 WHERE payments.invoice_id = invoices.id
--                   AND payments.payment_status = 'paid'
--
-- EXCLUSION RULES:
--   • Cancelled invoices (invoice_status = 'cancelled') do NOT count towards
--     total_invoiced_amount or bookings_with_invoice_count.
--   • Only payments with payment_status = 'paid' contribute to total_paid_amount.
--   • Cancelled payouts (payout_status = 'cancelled') do NOT contribute to
--     any payout bucket total.
--
-- SCOPE RULES (per DB-RA-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ No materialized view
--   ✗ No refund / tax / reconciliation fields
--   ✗ No per-owner drilldown
--   ✗ No per-unit drilldown
--   ✗ No per-payment row explosion (one row per day)
--   ✗ No warehouse / fact / dimension tables
-- ============================================================================

CREATE OR REPLACE VIEW reporting_finance_daily_summary AS
WITH daily_invoices AS (
    -- Non-cancelled invoice totals per booking, for grouping by booking creation date
    SELECT
        b.id                                        AS booking_id,
        DATE(b.created_at)                          AS metric_date,
        i.id                                        AS invoice_id,
        COALESCE(i.total_amount, 0)                 AS invoice_total
    FROM bookings b
    LEFT JOIN invoices i
        ON i.booking_id = b.id
       AND i.invoice_status <> 'cancelled'
),
daily_paid AS (
    -- Paid payment totals per invoice
    SELECT
        p.invoice_id                                AS invoice_id,
        COALESCE(SUM(p.amount), 0)                  AS paid_amount
    FROM payments p
    WHERE p.payment_status = 'paid'
      AND p.invoice_id IS NOT NULL
    GROUP BY p.invoice_id
),
daily_payouts AS (
    -- Payout bucket sums per booking, for grouping by booking creation date
    SELECT
        b.id                                                                AS booking_id,
        DATE(b.created_at)                                                  AS metric_date,
        COALESCE(SUM(op.payout_amount) FILTER (WHERE op.payout_status = 'pending'),   0) AS pending_payout_amount,
        COALESCE(SUM(op.payout_amount) FILTER (WHERE op.payout_status = 'scheduled'), 0) AS scheduled_payout_amount,
        COALESCE(SUM(op.payout_amount) FILTER (WHERE op.payout_status = 'paid'),      0) AS paid_payout_amount
    FROM bookings b
    LEFT JOIN owner_payouts op
        ON op.booking_id = b.id
    GROUP BY b.id, DATE(b.created_at)
)
SELECT
    di.metric_date                                                          AS metric_date,
    COUNT(DISTINCT CASE WHEN di.invoice_id IS NOT NULL
                        THEN di.booking_id END)::INT                        AS bookings_with_invoice_count,
    COALESCE(SUM(di.invoice_total), 0)::DECIMAL(14,2)                       AS total_invoiced_amount,
    COALESCE(SUM(dp.paid_amount), 0)::DECIMAL(14,2)                         AS total_paid_amount,
    (COALESCE(SUM(di.invoice_total), 0)
     - COALESCE(SUM(dp.paid_amount), 0))::DECIMAL(14,2)                     AS total_remaining_amount,
    COALESCE(SUM(dpo.pending_payout_amount), 0)::DECIMAL(14,2)              AS total_pending_payout_amount,
    COALESCE(SUM(dpo.scheduled_payout_amount), 0)::DECIMAL(14,2)            AS total_scheduled_payout_amount,
    COALESCE(SUM(dpo.paid_payout_amount), 0)::DECIMAL(14,2)                 AS total_paid_payout_amount
FROM daily_invoices di
LEFT JOIN daily_paid dp
    ON dp.invoice_id = di.invoice_id
LEFT JOIN daily_payouts dpo
    ON dpo.booking_id = di.booking_id
   AND dpo.metric_date = di.metric_date
GROUP BY
    di.metric_date;

COMMENT ON VIEW reporting_finance_daily_summary IS
    'Reports & Analytics read model: daily finance summary by booking creation date. '
    'Covers invoiced/paid/remaining totals and payout bucket sums. '
    'Cancelled invoices and non-paid payments excluded. '
    'Source: bookings, invoices, payments, owner_payouts. Scope frozen per DB-RA-01.';
