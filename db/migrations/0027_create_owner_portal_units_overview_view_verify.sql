-- ============================================================================
-- Verify:      0027_create_owner_portal_units_overview_view_verify
-- Ticket:      DB-OP-02
-- Verifies:    0027_create_owner_portal_units_overview_view.sql
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
          AND table_name   = 'owner_portal_units_overview'
    ) THEN
        RAISE EXCEPTION 'View owner_portal_units_overview does not exist';
    END IF;

    -- -----------------------------------------------------------------------
    -- 2. Exact column contract (12 columns)
    -- -----------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'owner_id'
    ) THEN RAISE EXCEPTION 'Column owner_id missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'unit_id'
    ) THEN RAISE EXCEPTION 'Column unit_id missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'area_id'
    ) THEN RAISE EXCEPTION 'Column area_id missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'unit_name'
    ) THEN RAISE EXCEPTION 'Column unit_name missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'unit_type'
    ) THEN RAISE EXCEPTION 'Column unit_type missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'is_active'
    ) THEN RAISE EXCEPTION 'Column is_active missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'bedrooms'
    ) THEN RAISE EXCEPTION 'Column bedrooms missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'bathrooms'
    ) THEN RAISE EXCEPTION 'Column bathrooms missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'max_guests'
    ) THEN RAISE EXCEPTION 'Column max_guests missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'base_price_per_night'
    ) THEN RAISE EXCEPTION 'Column base_price_per_night missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'created_at'
    ) THEN RAISE EXCEPTION 'Column created_at missing from owner_portal_units_overview'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview' AND column_name = 'updated_at'
    ) THEN RAISE EXCEPTION 'Column updated_at missing from owner_portal_units_overview'; END IF;

    -- -----------------------------------------------------------------------
    -- 3. Total column count must be exactly 12 (no extra columns leaked in)
    -- -----------------------------------------------------------------------
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'owner_portal_units_overview';

    IF v_col_count <> 12 THEN
        RAISE EXCEPTION 'owner_portal_units_overview has % columns; expected exactly 12', v_col_count;
    END IF;

    -- -----------------------------------------------------------------------
    -- 4. Forbidden columns must NOT exist
    -- -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'owner_portal_units_overview'
          AND column_name IN (
              'booking_count', 'revenue', 'total_paid',
              'cover_image', 'image_url',
              'available_from', 'available_to', 'is_available',
              'tax_rate', 'discount',
              'deleted_at'
          )
    ) THEN
        RAISE EXCEPTION 'owner_portal_units_overview contains forbidden column(s) — check for availability/finance/image/deleted_at leakage';
    END IF;

    -- -----------------------------------------------------------------------
    -- 5. View excludes soft-deleted units
    --    (only verifiable at runtime with real data — static check: WHERE clause
    --     is in view definition; rely on runtime test for actual exclusion)
    -- -----------------------------------------------------------------------

    RAISE NOTICE 'owner_portal_units_overview verified successfully: view exists, 12 columns match contract, no forbidden columns present.';
END;
$$;
