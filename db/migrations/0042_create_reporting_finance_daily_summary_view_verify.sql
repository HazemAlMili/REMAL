-- ============================================================================
-- Verify:      0042_create_reporting_finance_daily_summary_view_verify
-- Ticket:      DB-RA-03
-- Verifies:    0042_create_reporting_finance_daily_summary_view.sql
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
          AND table_name   = 'reporting_finance_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View reporting_finance_daily_summary does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (8 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'metric_date'
    ) THEN RAISE EXCEPTION 'Column metric_date missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'bookings_with_invoice_count'
    ) THEN RAISE EXCEPTION 'Column bookings_with_invoice_count missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_invoiced_amount'
    ) THEN RAISE EXCEPTION 'Column total_invoiced_amount missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_paid_amount'
    ) THEN RAISE EXCEPTION 'Column total_paid_amount missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_remaining_amount'
    ) THEN RAISE EXCEPTION 'Column total_remaining_amount missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_pending_payout_amount'
    ) THEN RAISE EXCEPTION 'Column total_pending_payout_amount missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_scheduled_payout_amount'
    ) THEN RAISE EXCEPTION 'Column total_scheduled_payout_amount missing from reporting_finance_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_paid_payout_amount'
    ) THEN RAISE EXCEPTION 'Column total_paid_payout_amount missing from reporting_finance_daily_summary'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count = 8 (no extra drilldown fields leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'reporting_finance_daily_summary';

    IF v_col_count <> 8 THEN
        RAISE EXCEPTION
            'reporting_finance_daily_summary has % columns, expected 8. '
            'Check for owner/unit/refund/tax/reconciliation fields that should not be present.',
            v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Scope guard: per-owner / per-unit / refund drilldown columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary'
          AND column_name IN (
              'owner_id', 'unit_id', 'booking_id', 'invoice_id',
              'refund_amount', 'tax_amount', 'reconciliation_amount'
          )
    ) THEN
        RAISE EXCEPTION
            'Scope violation: reporting_finance_daily_summary contains per-owner/unit/refund/tax '
            'drilldown columns that are out of scope for this view';
    END IF;

    RAISE NOTICE 'reporting_finance_daily_summary verified OK: 8 columns, no drilldown leakage.';
END;
$$;
