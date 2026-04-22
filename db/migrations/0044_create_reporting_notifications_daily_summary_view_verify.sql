-- ============================================================================
-- Verify:      0044_create_reporting_notifications_daily_summary_view_verify
-- Ticket:      DB-RA-05
-- Verifies:    0044_create_reporting_notifications_daily_summary_view.sql
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
          AND table_name   = 'reporting_notifications_daily_summary'
    ) THEN
        RAISE EXCEPTION 'View reporting_notifications_daily_summary does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (10 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'metric_date'
    ) THEN RAISE EXCEPTION 'Column metric_date missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'channel'
    ) THEN RAISE EXCEPTION 'Column channel missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'notifications_created_count'
    ) THEN RAISE EXCEPTION 'Column notifications_created_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'pending_notifications_count'
    ) THEN RAISE EXCEPTION 'Column pending_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'queued_notifications_count'
    ) THEN RAISE EXCEPTION 'Column queued_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'sent_notifications_count'
    ) THEN RAISE EXCEPTION 'Column sent_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'delivered_notifications_count'
    ) THEN RAISE EXCEPTION 'Column delivered_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'failed_notifications_count'
    ) THEN RAISE EXCEPTION 'Column failed_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'cancelled_notifications_count'
    ) THEN RAISE EXCEPTION 'Column cancelled_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'read_notifications_count'
    ) THEN RAISE EXCEPTION 'Column read_notifications_count missing from reporting_notifications_daily_summary'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count = 10 (no extra drilldown fields leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'reporting_notifications_daily_summary';

    IF v_col_count <> 10 THEN
        RAISE EXCEPTION
            'reporting_notifications_daily_summary has % columns, expected 10. '
            'Check for provider/webhook/campaign/recipient drilldown fields.',
            v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Scope guard: forbidden drilldown/analytics columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary'
          AND column_name IN (
              'admin_user_id', 'client_id', 'owner_id',
              'provider_name', 'provider_message_id',
              'campaign_id', 'campaign_name',
              'webhook_event', 'template_id'
          )
    ) THEN
        RAISE EXCEPTION
            'Scope violation: reporting_notifications_daily_summary contains provider/webhook/'
            'campaign/recipient drilldown columns that are out of scope for this view';
    END IF;

    RAISE NOTICE 'reporting_notifications_daily_summary verified OK: 10 columns, no drilldown leakage.';
END;
$$;
