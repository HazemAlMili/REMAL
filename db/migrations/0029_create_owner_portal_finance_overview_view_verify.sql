-- ============================================================================
-- Verify:      0029_create_owner_portal_finance_overview_view_verify
-- Ticket:      DB-OP-04
-- Verifies:    0029_create_owner_portal_finance_overview_view.sql
-- ============================================================================

DO $$
DECLARE
    v_col_count INT;
BEGIN
    -- -----------------------------------------------------------------------
    -- 1. View exists
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name   = 'owner_portal_finance_overview'
    ) THEN
        RAISE EXCEPTION 'View owner_portal_finance_overview does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (13 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'owner_id'
    ) THEN RAISE EXCEPTION 'Column owner_id missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'booking_id'
    ) THEN RAISE EXCEPTION 'Column booking_id missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'unit_id'
    ) THEN RAISE EXCEPTION 'Column unit_id missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'invoice_id'
    ) THEN RAISE EXCEPTION 'Column invoice_id missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'invoice_status'
    ) THEN RAISE EXCEPTION 'Column invoice_status missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'invoiced_amount'
    ) THEN RAISE EXCEPTION 'Column invoiced_amount missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'paid_amount'
    ) THEN RAISE EXCEPTION 'Column paid_amount missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'remaining_amount'
    ) THEN RAISE EXCEPTION 'Column remaining_amount missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_id'
    ) THEN RAISE EXCEPTION 'Column payout_id missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_status'
    ) THEN RAISE EXCEPTION 'Column payout_status missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_amount'
    ) THEN RAISE EXCEPTION 'Column payout_amount missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_scheduled_at'
    ) THEN RAISE EXCEPTION 'Column payout_scheduled_at missing from owner_portal_finance_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_paid_at'
    ) THEN RAISE EXCEPTION 'Column payout_paid_at missing from owner_portal_finance_overview'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count must be exactly 13 (no extra columns leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_finance_overview';

    IF v_col_count <> 13 THEN
        RAISE EXCEPTION 'owner_portal_finance_overview has % columns; expected exactly 13', v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Forbidden columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview'
          AND column_name IN (
              -- Refund / tax / reconciliation
              'refund_amount', 'refund_id', 'tax_amount', 'tax_rate',
              'reconciled', 'reconciliation_id',
              -- Bank / gateway
              'bank_account', 'bank_reference', 'gateway_response',
              -- Per-payment row fields
              'payment_id', 'payment_method', 'reference_number',
              -- Invoice item detail
              'line_type', 'unit_amount', 'line_total',
              -- Soft delete or audit noise
              'deleted_at'
          )
    ) THEN
        RAISE EXCEPTION 'owner_portal_finance_overview contains forbidden column(s) — check for refund/tax/bank/per-payment/item leakage';
    END IF;

    -- -----------------------------------------------------------------------
    -- 5. paid_amount uses paid payments only
    --    Static check: verified by view definition (payment_status = 'paid').
    --    Runtime verification: requires data — insert booking + invoice +
    --    payments with mixed statuses and assert only paid payments are summed.
    -- -----------------------------------------------------------------------

    RAISE NOTICE 'owner_portal_finance_overview verified successfully: view exists, 13 columns match contract, no forbidden columns present.';
END;
$$;
