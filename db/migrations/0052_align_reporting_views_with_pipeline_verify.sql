-- Verify:      0052_align_reporting_views_with_pipeline
-- Purpose:     Confirm reporting uses prospecting and excludes inactive
--              invoices from finance totals.

DO $$
DECLARE
    v_booking_column_count INT;
    v_booking_definition TEXT;
    v_finance_definition TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name = 'reporting_booking_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View public.reporting_booking_daily_summary does not exist';
    END IF;

    SELECT COUNT(*)
    INTO v_booking_column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reporting_booking_daily_summary';

    IF v_booking_column_count <> 8 THEN
        RAISE EXCEPTION
            'reporting_booking_daily_summary has % columns; expected 8',
            v_booking_column_count;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reporting_booking_daily_summary'
          AND column_name = 'prospecting_bookings_count'
    ) THEN
        RAISE EXCEPTION 'Column prospecting_bookings_count is missing';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reporting_booking_daily_summary'
          AND column_name = 'pending_bookings_count'
    ) THEN
        RAISE EXCEPTION 'Legacy column pending_bookings_count still exists';
    END IF;

    SELECT pg_get_viewdef('public.reporting_booking_daily_summary'::regclass, true)
    INTO v_booking_definition;

    IF POSITION('prospecting' IN v_booking_definition) = 0
       OR POSITION('pending' IN v_booking_definition) > 0 THEN
        RAISE EXCEPTION
            'Booking reporting view is not aligned with prospecting: %',
            v_booking_definition;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM reporting_booking_daily_summary actual
        FULL JOIN (
            SELECT
                DATE(created_at) AS metric_date,
                source AS booking_source,
                COUNT(*) FILTER (WHERE booking_status = 'prospecting')::INT
                    AS prospecting_bookings_count
            FROM bookings
            GROUP BY DATE(created_at), source
        ) expected
            USING (metric_date, booking_source)
        WHERE actual.metric_date IS NULL
           OR expected.metric_date IS NULL
           OR actual.prospecting_bookings_count
              <> expected.prospecting_bookings_count
    ) THEN
        RAISE EXCEPTION 'Prospecting counts do not match bookings source data';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name = 'reporting_finance_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View public.reporting_finance_daily_summary does not exist';
    END IF;

    SELECT pg_get_viewdef('public.reporting_finance_daily_summary'::regclass, true)
    INTO v_finance_definition;

    IF POSITION('cancelled' IN v_finance_definition) = 0
       OR POSITION('superseded' IN v_finance_definition) = 0 THEN
        RAISE EXCEPTION
            'Finance reporting view does not exclude inactive invoices: %',
            v_finance_definition;
    END IF;

    RAISE NOTICE '0052 verified: booking and finance reporting are pipeline-aligned.';
END;
$$;
