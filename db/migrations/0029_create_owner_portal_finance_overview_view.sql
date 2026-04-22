-- ============================================================================
-- Migration:   0029_create_owner_portal_finance_overview_view
-- Ticket:      DB-OP-04
-- Title:       Create owner_portal_finance_overview SQL view for owner-facing
--              finance reads
-- Database:    PostgreSQL 16
-- Depends on:  0016_create_bookings    (bookings table)
--              0022_create_payments    (payments table)
--              0023_create_invoices    (invoices table)
--              0025_create_owner_payouts (owner_payouts table)
--              0028_create_owner_portal_bookings_overview_view (DB-OP-03)
--              0009_owner_portal_db_scope decision (read-model-first freeze)
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that combines invoice, paid-payment aggregate,
--   remaining balance, and payout snapshot into a single owner-facing finance
--   row per booking. Eliminates repeated finance joins and aggregations from
--   higher-tier layers.
--
-- VIEW CONTRACT (13 columns):
--   owner_id              UUID             — owner of the booked unit
--   booking_id            UUID             — booking primary key
--   unit_id               UUID             — unit that was booked
--   invoice_id            UUID NULL        — active (non-cancelled) invoice, if any
--   invoice_status        VARCHAR NULL     — current invoice status
--   invoiced_amount       DECIMAL(12,2)    — invoice total; 0 if no active invoice
--   paid_amount           DECIMAL(12,2)    — sum of paid payments linked to invoice; 0 if none
--   remaining_amount      DECIMAL(12,2)    — invoiced_amount - paid_amount
--   payout_id             UUID NULL        — owner payout snapshot, if any
--   payout_status         VARCHAR NULL     — current payout status
--   payout_amount         DECIMAL(12,2) NULL — owner net payout amount
--   payout_scheduled_at   TIMESTAMP NULL   — when payout was scheduled
--   payout_paid_at        TIMESTAMP NULL   — when payout was marked paid
--
-- JOIN LOGIC:
--   FROM bookings
--   LEFT JOIN invoices ON invoices.booking_id = bookings.id
--                      AND invoices.invoice_status <> 'cancelled'
--   LEFT JOIN owner_payouts ON owner_payouts.booking_id = bookings.id
--   paid_amount = correlated subquery: SUM(payments.amount)
--                 WHERE payments.invoice_id = invoices.id
--                   AND payments.payment_status = 'paid'
--
-- SCOPE RULES (per DB-OP-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ paid_amount includes only 'paid' status payments
--   ✓ Cancelled invoices excluded from active finance representation
--   ✗ No refund/tax/reconciliation/bank fields
--   ✗ No per-payment row explosion (one row per booking)
--   ✗ No invoice item detail
--   ✗ No materialized view
-- ============================================================================

CREATE OR REPLACE VIEW owner_portal_finance_overview AS
WITH booking_finance AS (
    SELECT
        b.owner_id                                          AS owner_id,
        b.id                                                AS booking_id,
        b.unit_id                                           AS unit_id,
        i.id                                                AS invoice_id,
        i.invoice_status                                    AS invoice_status,
        COALESCE(i.total_amount, 0)                         AS invoiced_amount,
        COALESCE((
            SELECT SUM(p.amount)
            FROM payments p
            WHERE p.invoice_id = i.id
              AND p.payment_status = 'paid'
        ), 0)                                               AS paid_amount,
        op.id                                               AS payout_id,
        op.payout_status                                    AS payout_status,
        op.payout_amount                                    AS payout_amount,
        op.scheduled_at                                     AS payout_scheduled_at,
        op.paid_at                                          AS payout_paid_at
    FROM bookings b
    LEFT JOIN invoices i
        ON i.booking_id = b.id
        AND i.invoice_status <> 'cancelled'
    LEFT JOIN owner_payouts op
        ON op.booking_id = b.id
)
SELECT
    owner_id,
    booking_id,
    unit_id,
    invoice_id,
    invoice_status,
    invoiced_amount,
    paid_amount,
    invoiced_amount - paid_amount           AS remaining_amount,
    payout_id,
    payout_status,
    payout_amount,
    payout_scheduled_at,
    payout_paid_at
FROM booking_finance;

COMMENT ON VIEW owner_portal_finance_overview IS
    'Owner Portal read model: booking-level finance snapshot per owner. '
    'paid_amount = SUM of paid payments linked to active invoice only. '
    'Cancelled invoices excluded. No refund/tax/bank fields. '
    'Source: bookings + invoices + payments + owner_payouts. '
    'Scope frozen per DB-OP-01.';
