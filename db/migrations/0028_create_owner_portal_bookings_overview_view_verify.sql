-- ============================================================================
-- Verify:      0028_create_owner_portal_bookings_overview_view_verify
-- Ticket:      DB-OP-03
-- Verifies:    0028_create_owner_portal_bookings_overview_view.sql
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
          AND table_name   = 'owner_portal_bookings_overview'
    ) THEN
        RAISE EXCEPTION 'View owner_portal_bookings_overview does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (13 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'owner_id'
    ) THEN RAISE EXCEPTION 'Column owner_id missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'booking_id'
    ) THEN RAISE EXCEPTION 'Column booking_id missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'unit_id'
    ) THEN RAISE EXCEPTION 'Column unit_id missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'client_id'
    ) THEN RAISE EXCEPTION 'Column client_id missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'assigned_admin_user_id'
    ) THEN RAISE EXCEPTION 'Column assigned_admin_user_id missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'booking_status'
    ) THEN RAISE EXCEPTION 'Column booking_status missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'check_in_date'
    ) THEN RAISE EXCEPTION 'Column check_in_date missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'check_out_date'
    ) THEN RAISE EXCEPTION 'Column check_out_date missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'guest_count'
    ) THEN RAISE EXCEPTION 'Column guest_count missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'final_amount'
    ) THEN RAISE EXCEPTION 'Column final_amount missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'source'
    ) THEN RAISE EXCEPTION 'Column source missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'created_at'
    ) THEN RAISE EXCEPTION 'Column created_at missing from owner_portal_bookings_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview' AND column_name = 'updated_at'
    ) THEN RAISE EXCEPTION 'Column updated_at missing from owner_portal_bookings_overview'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count must be exactly 13 (no extra columns leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_bookings_overview';

    IF v_col_count <> 13 THEN
        RAISE EXCEPTION 'owner_portal_bookings_overview has % columns; expected exactly 13', v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Forbidden columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_bookings_overview'
          AND column_name IN (
              -- CRM leakage
              'crm_notes', 'crm_stage', 'assignment_history',
              'notes_count', 'last_note',
              -- Finance leakage
              'invoice_id', 'invoice_status', 'paid_amount',
              'remaining_amount', 'payout_status',
              -- Client PII leakage
              'client_name', 'client_email', 'client_phone',
              'client_full_name',
              -- Soft delete
              'deleted_at'
          )
    ) THEN
        RAISE EXCEPTION 'owner_portal_bookings_overview contains forbidden column(s) — check for CRM/finance/client-PII/deleted_at leakage';
    END IF;

    -- -----------------------------------------------------------------------
    -- 5. owner_id derives from bookings.owner_id (structural — verified by
    --    view definition; runtime correctness requires data-level test)
    -- -----------------------------------------------------------------------

    RAISE NOTICE 'owner_portal_bookings_overview verified successfully: view exists, 13 columns match contract, no forbidden columns present.';
END;
$$;
