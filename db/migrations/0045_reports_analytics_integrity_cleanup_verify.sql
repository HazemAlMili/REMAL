-- ============================================================================
-- Verify:      0045_reports_analytics_integrity_cleanup_verify
-- Ticket:      DB-RA-06
-- Purpose:     Comprehensive cross-view integrity verification for the
--              Reports & Analytics domain (DB-RA-01 through DB-RA-05)
-- ============================================================================
--
-- COVERAGE:
--   1. All four reporting views exist
--   2. reporting_booking_daily_summary  — exact 8-column contract + scope guards
--   3. reporting_finance_daily_summary  — exact 8-column contract + scope guards
--   4. reporting_reviews_daily_summary  — exact 5-column contract + scope guards
--   5. reporting_notifications_daily_summary — exact 10-column contract + scope guards
--   6. No warehouse / fact / dimension / staging tables in the public schema
--   7. No materialized views in the public schema
--   8. No provider / community / marketing / helpfulness columns leaked
-- ============================================================================

DO $$
DECLARE
    v_col_count        INT;
    v_warehouse_count  INT;
    v_matview_count    INT;
BEGIN

    RAISE NOTICE '======================================================';
    RAISE NOTICE 'Reports & Analytics — DB-RA-06 Integrity Verify Begin';
    RAISE NOTICE '======================================================';

    -- ==================================================================
    -- SECTION 1: All four reporting views exist
    -- ==================================================================

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name   = 'reporting_booking_daily_summary'
    ) THEN RAISE EXCEPTION '[DB-RA-02] View reporting_booking_daily_summary is missing'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name   = 'reporting_finance_daily_summary'
    ) THEN RAISE EXCEPTION '[DB-RA-03] View reporting_finance_daily_summary is missing'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name   = 'reporting_reviews_daily_summary'
    ) THEN RAISE EXCEPTION '[DB-RA-04] View reporting_reviews_daily_summary is missing'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name   = 'reporting_notifications_daily_summary'
    ) THEN RAISE EXCEPTION '[DB-RA-05] View reporting_notifications_daily_summary is missing'; END IF;

    RAISE NOTICE '[PASS] Section 1: All 4 reporting views exist.';

    -- ==================================================================
    -- SECTION 2: reporting_booking_daily_summary (DB-RA-02)
    --            Expected: exactly 8 columns
    -- ==================================================================

    -- 2a. Column presence checks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'metric_date')
        THEN RAISE EXCEPTION '[DB-RA-02] Column metric_date missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'booking_source')
        THEN RAISE EXCEPTION '[DB-RA-02] Column booking_source missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'bookings_created_count')
        THEN RAISE EXCEPTION '[DB-RA-02] Column bookings_created_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'pending_bookings_count')
        THEN RAISE EXCEPTION '[DB-RA-02] Column pending_bookings_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'confirmed_bookings_count')
        THEN RAISE EXCEPTION '[DB-RA-02] Column confirmed_bookings_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'cancelled_bookings_count')
        THEN RAISE EXCEPTION '[DB-RA-02] Column cancelled_bookings_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'completed_bookings_count')
        THEN RAISE EXCEPTION '[DB-RA-02] Column completed_bookings_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_booking_daily_summary' AND column_name = 'total_final_amount')
        THEN RAISE EXCEPTION '[DB-RA-02] Column total_final_amount missing'; END IF;

    -- 2b. Exact column count
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_name = 'reporting_booking_daily_summary';
    IF v_col_count <> 8 THEN
        RAISE EXCEPTION '[DB-RA-02] reporting_booking_daily_summary has % columns, expected 8', v_col_count;
    END IF;

    -- 2c. Scope guards — forbidden drilldown columns must not exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_booking_daily_summary'
          AND column_name IN ('owner_id', 'unit_id', 'admin_user_id', 'assigned_admin_user_id',
                              'client_id', 'crm_field', 'check_in_date', 'check_out_date')
    ) THEN
        RAISE EXCEPTION '[DB-RA-02] Scope violation: forbidden drilldown column detected in reporting_booking_daily_summary';
    END IF;

    RAISE NOTICE '[PASS] Section 2: reporting_booking_daily_summary — 8 columns, no scope drift.';

    -- ==================================================================
    -- SECTION 3: reporting_finance_daily_summary (DB-RA-03)
    --            Expected: exactly 8 columns
    -- ==================================================================

    -- 3a. Column presence checks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'metric_date')
        THEN RAISE EXCEPTION '[DB-RA-03] Column metric_date missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'bookings_with_invoice_count')
        THEN RAISE EXCEPTION '[DB-RA-03] Column bookings_with_invoice_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_invoiced_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_invoiced_amount missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_paid_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_paid_amount missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_remaining_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_remaining_amount missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_pending_payout_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_pending_payout_amount missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_scheduled_payout_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_scheduled_payout_amount missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_finance_daily_summary' AND column_name = 'total_paid_payout_amount')
        THEN RAISE EXCEPTION '[DB-RA-03] Column total_paid_payout_amount missing'; END IF;

    -- 3b. Exact column count
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_name = 'reporting_finance_daily_summary';
    IF v_col_count <> 8 THEN
        RAISE EXCEPTION '[DB-RA-03] reporting_finance_daily_summary has % columns, expected 8', v_col_count;
    END IF;

    -- 3c. Scope guards — forbidden fields must not exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_finance_daily_summary'
          AND column_name IN ('owner_id', 'unit_id', 'booking_id', 'invoice_id',
                              'refund_amount', 'tax_amount', 'reconciliation_amount',
                              'commission_amount', 'gross_booking_amount')
    ) THEN
        RAISE EXCEPTION '[DB-RA-03] Scope violation: forbidden refund/tax/reconciliation/drilldown column detected in reporting_finance_daily_summary';
    END IF;

    RAISE NOTICE '[PASS] Section 3: reporting_finance_daily_summary — 8 columns, no scope drift.';

    -- ==================================================================
    -- SECTION 4: reporting_reviews_daily_summary (DB-RA-04)
    --            Expected: exactly 5 columns
    -- ==================================================================

    -- 4a. Column presence checks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'metric_date')
        THEN RAISE EXCEPTION '[DB-RA-04] Column metric_date missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'published_reviews_count')
        THEN RAISE EXCEPTION '[DB-RA-04] Column published_reviews_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'average_rating')
        THEN RAISE EXCEPTION '[DB-RA-04] Column average_rating missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'reviews_with_owner_reply_count')
        THEN RAISE EXCEPTION '[DB-RA-04] Column reviews_with_owner_reply_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_reviews_daily_summary' AND column_name = 'reviews_with_visible_owner_reply_count')
        THEN RAISE EXCEPTION '[DB-RA-04] Column reviews_with_visible_owner_reply_count missing'; END IF;

    -- 4b. Exact column count
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_name = 'reporting_reviews_daily_summary';
    IF v_col_count <> 5 THEN
        RAISE EXCEPTION '[DB-RA-04] reporting_reviews_daily_summary has % columns, expected 5', v_col_count;
    END IF;

    -- 4c. Scope guards — community/helpfulness/media/sentiment must not exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_reviews_daily_summary'
          AND column_name IN ('owner_id', 'unit_id', 'client_id', 'booking_id',
                              'helpfulness_count', 'helpful_count', 'unhelpful_count',
                              'report_count', 'media_count', 'attachment_count',
                              'sentiment_score', 'sentiment_label')
    ) THEN
        RAISE EXCEPTION '[DB-RA-04] Scope violation: forbidden helpfulness/media/sentiment/drilldown column detected in reporting_reviews_daily_summary';
    END IF;

    RAISE NOTICE '[PASS] Section 4: reporting_reviews_daily_summary — 5 columns, no scope drift.';

    -- ==================================================================
    -- SECTION 5: reporting_notifications_daily_summary (DB-RA-05)
    --            Expected: exactly 10 columns
    -- ==================================================================

    -- 5a. Column presence checks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'metric_date')
        THEN RAISE EXCEPTION '[DB-RA-05] Column metric_date missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'channel')
        THEN RAISE EXCEPTION '[DB-RA-05] Column channel missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'notifications_created_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column notifications_created_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'pending_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column pending_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'queued_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column queued_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'sent_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column sent_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'delivered_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column delivered_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'failed_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column failed_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'cancelled_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column cancelled_notifications_count missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reporting_notifications_daily_summary' AND column_name = 'read_notifications_count')
        THEN RAISE EXCEPTION '[DB-RA-05] Column read_notifications_count missing'; END IF;

    -- 5b. Exact column count
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_name = 'reporting_notifications_daily_summary';
    IF v_col_count <> 10 THEN
        RAISE EXCEPTION '[DB-RA-05] reporting_notifications_daily_summary has % columns, expected 10', v_col_count;
    END IF;

    -- 5c. Scope guards — provider/webhook/campaign/recipient must not exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reporting_notifications_daily_summary'
          AND column_name IN ('admin_user_id', 'client_id', 'owner_id', 'template_id',
                              'provider_name', 'provider_message_id',
                              'campaign_id', 'campaign_name',
                              'webhook_event', 'webhook_status')
    ) THEN
        RAISE EXCEPTION '[DB-RA-05] Scope violation: forbidden provider/webhook/campaign/recipient column detected in reporting_notifications_daily_summary';
    END IF;

    RAISE NOTICE '[PASS] Section 5: reporting_notifications_daily_summary — 10 columns, no scope drift.';

    -- ==================================================================
    -- SECTION 6: No warehouse / fact / dimension / staging tables
    -- ==================================================================

    SELECT COUNT(*) INTO v_warehouse_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type   = 'BASE TABLE'
      AND (
          table_name LIKE 'fact_%'
       OR table_name LIKE 'dim_%'
       OR table_name LIKE 'staging_%'
       OR table_name LIKE 'stg_%'
       OR table_name LIKE 'dwh_%'
       OR table_name LIKE 'warehouse_%'
       OR table_name LIKE 'mart_%'
      );

    IF v_warehouse_count > 0 THEN
        RAISE EXCEPTION
            '[DB-RA-06] Scope violation: % warehouse/fact/dimension/staging table(s) detected in public schema. '
            'Reports & Analytics Tier 1 is read-model-first — no warehouse scope allowed.',
            v_warehouse_count;
    END IF;

    RAISE NOTICE '[PASS] Section 6: No warehouse/fact/dimension/staging tables detected.';

    -- ==================================================================
    -- SECTION 7: No materialized views in the public schema
    -- ==================================================================

    SELECT COUNT(*) INTO v_matview_count
    FROM pg_matviews
    WHERE schemaname = 'public';

    IF v_matview_count > 0 THEN
        RAISE EXCEPTION
            '[DB-RA-06] Scope violation: % materialized view(s) detected in public schema. '
            'Reports & Analytics MVP explicitly prohibits materialized views.',
            v_matview_count;
    END IF;

    RAISE NOTICE '[PASS] Section 7: No materialized views detected.';

    -- ==================================================================
    -- SECTION 8: Cross-domain community/provider/marketing leak guard
    --            Checks that no reporting view has a reporting_* or
    --            analytics_* prefix that is NOT one of the four approved views
    -- ==================================================================

    IF EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
          AND (table_name LIKE 'reporting_%' OR table_name LIKE 'analytics_%')
          AND table_name NOT IN (
              'reporting_booking_daily_summary',
              'reporting_finance_daily_summary',
              'reporting_reviews_daily_summary',
              'reporting_notifications_daily_summary'
          )
    ) THEN
        RAISE EXCEPTION
            '[DB-RA-06] Unexpected reporting/analytics view detected in public schema '
            'that is not in the approved four-view MVP contract. '
            'Check for unauthorized community/provider/marketing reporting extensions.';
    END IF;

    RAISE NOTICE '[PASS] Section 8: No unauthorized reporting/analytics views detected.';

    -- ==================================================================
    -- FINAL SUMMARY
    -- ==================================================================

    RAISE NOTICE '======================================================';
    RAISE NOTICE 'Reports & Analytics — DB-RA-06 Integrity Verify PASSED';
    RAISE NOTICE 'All 8 checks passed. Domain is ready for Tier 2.';
    RAISE NOTICE '======================================================';

END;
$$;
