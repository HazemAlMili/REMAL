-- ============================================================================
-- Verify:      0030_owner_portal_integrity_cleanup_verify
-- Ticket:      DB-OP-05
-- Verifies:    Full Owner Portal Tier 1 DB domain (DB-OP-01 through DB-OP-05)
-- ============================================================================
--
-- Comprehensive cross-view assertion covering:
--   1. All three portal views exist
--   2. Each view has the exact contracted column count
--   3. No forbidden columns leaked into any view
--   4. No unintended owner_portal_* transactional write tables exist
--   5. No materialized views exist for the portal domain
-- ============================================================================

DO $$
DECLARE
    v_col_count INT;
BEGIN
    -- =======================================================================
    -- SECTION 1: All three Owner Portal views must exist
    -- =======================================================================

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public' AND table_name = 'owner_portal_units_overview'
    ) THEN RAISE EXCEPTION '[DB-OP-02] View owner_portal_units_overview does not exist'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public' AND table_name = 'owner_portal_bookings_overview'
    ) THEN RAISE EXCEPTION '[DB-OP-03] View owner_portal_bookings_overview does not exist'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public' AND table_name = 'owner_portal_finance_overview'
    ) THEN RAISE EXCEPTION '[DB-OP-04] View owner_portal_finance_overview does not exist'; END IF;

    -- =======================================================================
    -- SECTION 2: Column count contracts
    -- =======================================================================

    -- owner_portal_units_overview: 12 columns
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_units_overview';

    IF v_col_count <> 12 THEN
        RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview has % columns; expected 12', v_col_count;
    END IF;

    -- owner_portal_bookings_overview: 13 columns
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_bookings_overview';

    IF v_col_count <> 13 THEN
        RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview has % columns; expected 13', v_col_count;
    END IF;

    -- owner_portal_finance_overview: 13 columns
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_finance_overview';

    IF v_col_count <> 13 THEN
        RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview has % columns; expected 13', v_col_count;
    END IF;

    -- =======================================================================
    -- SECTION 3: units_overview — required columns and forbidden columns
    -- =======================================================================

    -- Required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_units_overview' AND column_name = 'owner_id')
    THEN RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview missing owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_units_overview' AND column_name = 'unit_id')
    THEN RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview missing unit_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_units_overview' AND column_name = 'area_id')
    THEN RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview missing area_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_units_overview' AND column_name = 'base_price_per_night')
    THEN RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview missing base_price_per_night'; END IF;

    -- Forbidden
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview'
          AND column_name IN (
              'booking_count', 'revenue', 'total_paid',
              'cover_image', 'image_url',
              'available_from', 'available_to', 'is_available',
              'deleted_at', 'tax_rate', 'discount'
          )
    ) THEN
        RAISE EXCEPTION '[DB-OP-02] owner_portal_units_overview contains forbidden column(s)';
    END IF;

    -- =======================================================================
    -- SECTION 4: bookings_overview — required columns and forbidden columns
    -- =======================================================================

    -- Required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'owner_id')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'booking_id')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing booking_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'booking_status')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing booking_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'final_amount')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing final_amount'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'check_in_date')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing check_in_date'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'check_out_date')
    THEN RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview missing check_out_date'; END IF;

    -- Forbidden: CRM leakage
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview'
          AND column_name IN (
              'crm_notes', 'notes_count', 'last_note', 'crm_stage',
              'invoice_id', 'invoice_status', 'paid_amount',
              'remaining_amount', 'payout_status',
              'client_name', 'client_email', 'client_phone',
              'deleted_at'
          )
    ) THEN
        RAISE EXCEPTION '[DB-OP-03] owner_portal_bookings_overview contains forbidden column(s) — CRM/finance/client-PII leakage';
    END IF;

    -- =======================================================================
    -- SECTION 5: finance_overview — required columns and forbidden columns
    -- =======================================================================

    -- Required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'owner_id')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'booking_id')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing booking_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'invoiced_amount')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing invoiced_amount'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'paid_amount')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing paid_amount'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'remaining_amount')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing remaining_amount'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_status')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing payout_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_amount')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing payout_amount'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_scheduled_at')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing payout_scheduled_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_portal_finance_overview' AND column_name = 'payout_paid_at')
    THEN RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview missing payout_paid_at'; END IF;

    -- Forbidden: refund/tax/bank/reconciliation/per-payment leakage
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_finance_overview'
          AND column_name IN (
              'refund_amount', 'refund_id', 'tax_amount', 'tax_rate',
              'reconciled', 'reconciliation_id',
              'bank_account', 'bank_reference', 'gateway_response',
              'payment_id', 'payment_method', 'reference_number',
              'line_type', 'unit_amount', 'line_total',
              'deleted_at'
          )
    ) THEN
        RAISE EXCEPTION '[DB-OP-04] owner_portal_finance_overview contains forbidden column(s) — refund/tax/bank/per-payment leakage';
    END IF;

    -- =======================================================================
    -- SECTION 6: No unintended transactional write tables introduced
    -- Any owner_portal_* TABLE (not view) is a scope violation
    -- =======================================================================

    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type   = 'BASE TABLE'
          AND table_name   LIKE 'owner_portal_%'
    ) THEN
        RAISE EXCEPTION '[DB-OP-01] Scope violation: one or more owner_portal_* transactional write tables exist. '
                        'Owner Portal MVP is read-model-first — no new write tables are permitted in Tier 1.';
    END IF;

    -- =======================================================================
    -- SECTION 7: No materialized views for portal domain
    -- =======================================================================

    IF EXISTS (
        SELECT 1
        FROM pg_matviews
        WHERE schemaname = 'public'
          AND matviewname LIKE 'owner_portal_%'
    ) THEN
        RAISE EXCEPTION '[DB-OP-01] Scope violation: one or more owner_portal_* materialized views exist. '
                        'Materialized views are excluded from Owner Portal MVP.';
    END IF;

    RAISE NOTICE '=== Owner Portal Tier 1 DB integrity verified successfully ===';
    RAISE NOTICE '  [DB-OP-02] owner_portal_units_overview     : OK (12 columns)';
    RAISE NOTICE '  [DB-OP-03] owner_portal_bookings_overview  : OK (13 columns)';
    RAISE NOTICE '  [DB-OP-04] owner_portal_finance_overview   : OK (13 columns)';
    RAISE NOTICE '  [DB-OP-01] No owner_portal_* write tables  : OK';
    RAISE NOTICE '  [DB-OP-01] No owner_portal_* matviews      : OK';
    RAISE NOTICE '=== Owner Portal DB is ready for Data Access tier ===';
END;
$$;
