-- ============================================================================
-- Verify:      0043_create_reporting_reviews_daily_summary_view_verify
-- Ticket:      DB-RA-04
-- Verifies:    0043_create_reporting_reviews_daily_summary_view.sql
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
          AND table_name   = 'reporting_reviews_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View reporting_reviews_daily_summary does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (5 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'metric_date'
    ) THEN RAISE EXCEPTION 'Column metric_date missing from reporting_reviews_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'published_reviews_count'
    ) THEN RAISE EXCEPTION 'Column published_reviews_count missing from reporting_reviews_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'average_rating'
    ) THEN RAISE EXCEPTION 'Column average_rating missing from reporting_reviews_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'reviews_with_owner_reply_count'
    ) THEN RAISE EXCEPTION 'Column reviews_with_owner_reply_count missing from reporting_reviews_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'reviews_with_visible_owner_reply_count'
    ) THEN RAISE EXCEPTION 'Column reviews_with_visible_owner_reply_count missing from reporting_reviews_daily_summary'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count = 5 (no extra drilldown fields leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'reporting_reviews_daily_summary';

    IF v_col_count <> 5 THEN
        RAISE EXCEPTION
            'reporting_reviews_daily_summary has % columns, expected 5. '
            'Check for owner/unit/helpfulness/media/sentiment drilldown fields.',
            v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Scope guard: forbidden drilldown/analytics columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary'
          AND column_name IN (
              'owner_id', 'unit_id', 'client_id', 'booking_id',
              'helpfulness_count', 'helpful_count', 'report_count',
              'media_count', 'sentiment_score', 'sentiment_label'
          )
    ) THEN
        RAISE EXCEPTION
            'Scope violation: reporting_reviews_daily_summary contains owner/unit/helpfulness/'
            'media/sentiment drilldown columns that are out of scope for this view';
    END IF;

    RAISE NOTICE 'reporting_reviews_daily_summary verified OK: 5 columns, no drilldown leakage.';
END;
$$;
