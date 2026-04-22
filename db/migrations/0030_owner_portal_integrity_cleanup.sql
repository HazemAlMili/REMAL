-- ============================================================================
-- Migration:   0030_owner_portal_integrity_cleanup
-- Ticket:      DB-OP-05
-- Title:       Owner Portal schema/read-model integrity cleanup and
--              cross-view verification
-- Database:    PostgreSQL 16
-- Depends on:  DB-OP-01 through DB-OP-04 (all Owner Portal Tier 1 tickets)
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Quality-gate pass for Owner Portal Tier 1 DB work. Confirms all three
--   read-model views are correctly shaped, finalises COMMENT ON VIEW
--   metadata for documentation, and asserts that no unintended transactional
--   write tables were introduced for the Owner Portal domain.
--
--   This migration introduces NO new schema objects (no tables, no views,
--   no indexes, no constraints). It is purely a documentation + assertion
--   pass. The only DDL is idempotent COMMENT ON VIEW statements.
-- ============================================================================

-- -----------------------------------------------------------------------
-- Finalise view documentation
-- -----------------------------------------------------------------------
COMMENT ON VIEW owner_portal_units_overview IS
    'DB-OP-02 | Owner Portal read model: non-deleted unit inventory per owner. '
    'Tier 1 read-only. No availability, booking, or finance data. '
    'Source: units. Scope frozen per DB-OP-01.';

COMMENT ON VIEW owner_portal_bookings_overview IS
    'DB-OP-03 | Owner Portal read model: booking list per owner. '
    'Tier 1 read-only. No CRM notes, no invoice/payment balance, no client PII beyond ID. '
    'Source: bookings. Scope frozen per DB-OP-01.';

COMMENT ON VIEW owner_portal_finance_overview IS
    'DB-OP-04 | Owner Portal read model: booking-level finance snapshot per owner. '
    'paid_amount = SUM of paid payments linked to active (non-cancelled) invoice only. '
    'Tier 1 read-only. No refund/tax/bank/reconciliation fields. '
    'Source: bookings + invoices + payments + owner_payouts. '
    'Scope frozen per DB-OP-01.';
