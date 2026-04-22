-- ============================================================================
-- Verify:      0041_create_reporting_booking_daily_summary_view_verify
-- Ticket:      DB-RA-02
-- Verifies:    0041_create_reporting_booking_daily_summary_view.sql
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
          AND table_name   = 'reporting_booking_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View reporting_booking_daily_summary does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (8 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'metric_date'
    ) THEN RAISE EXCEPTION 'Column metric_date missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'booking_source'
    ) THEN RAISE EXCEPTION 'Column booking_source missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'bookings_created_count'
    ) THEN RAISE EXCEPTION 'Column bookings_created_count missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'pending_bookings_count'
    ) THEN RAISE EXCEPTION 'Column pending_bookings_count missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'confirmed_bookings_count'
    ) THEN RAISE EXCEPTION 'Column confirmed_bookings_count missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'cancelled_bookings_count'
    ) THEN RAISE EXCEPTION 'Column cancelled_bookings_count missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'completed_bookings_count'
    ) THEN RAISE EXCEPTION 'Column completed_bookings_count missing from reporting_booking_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'total_final_amount'
    ) THEN RAISE EXCEPTION 'Column total_final_amount missing from reporting_booking_daily_summary'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count = 8 (no extra drilldown fields leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'reporting_booking_daily_summary';

    IF v_col_count <> 8 THEN
        RAISE EXCEPTION
            'reporting_booking_daily_summary has % columns, expected 8. '
            'Check for owner/unit/admin/CRM drilldown fields that should not be present.',
            v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Scope guard: owner/unit/admin drilldown columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary'
          AND column_name IN ('owner_id', 'unit_id', 'admin_user_id', 'assigned_admin_user_id')
    ) THEN
        RAISE EXCEPTION
            'Scope violation: reporting_booking_daily_summary contains owner/unit/admin '
            'drilldown columns that are out of scope for this view';
    END IF;

    RAISE NOTICE 'reporting_booking_daily_summary verified OK: 8 columns, no drilldown leakage.';
END;
$$;
