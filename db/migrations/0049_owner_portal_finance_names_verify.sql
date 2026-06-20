-- Verify:      0049_owner_portal_finance_names
-- Purpose:     Confirm the owner finance view exposes display names and only
--              joins active invoices.

DO $$
DECLARE
    v_column_count INT;
    v_view_definition TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name = 'owner_portal_finance_overview'
    ) THEN
        RAISE EXCEPTION 'View public.owner_portal_finance_overview does not exist';
    END IF;

    SELECT COUNT(*)
    INTO v_column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'owner_portal_finance_overview';

    IF v_column_count <> 15 THEN
        RAISE EXCEPTION
            'owner_portal_finance_overview has % columns; expected 15',
            v_column_count;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'owner_portal_finance_overview'
          AND column_name = 'unit_name'
    ) THEN
        RAISE EXCEPTION 'Column unit_name is missing from owner_portal_finance_overview';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'owner_portal_finance_overview'
          AND column_name = 'client_name'
    ) THEN
        RAISE EXCEPTION 'Column client_name is missing from owner_portal_finance_overview';
    END IF;

    SELECT pg_get_viewdef('public.owner_portal_finance_overview'::regclass, true)
    INTO v_view_definition;

    IF POSITION('cancelled' IN v_view_definition) = 0
       OR POSITION('superseded' IN v_view_definition) = 0 THEN
        RAISE EXCEPTION
            'owner_portal_finance_overview does not exclude cancelled and superseded invoices: %',
            v_view_definition;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM owner_portal_finance_overview
        WHERE invoice_status IN ('cancelled', 'superseded')
    ) THEN
        RAISE EXCEPTION 'owner_portal_finance_overview exposes an inactive invoice';
    END IF;

    IF EXISTS (
        SELECT booking_id
        FROM owner_portal_finance_overview
        GROUP BY booking_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'owner_portal_finance_overview contains duplicate booking rows; check active invoice integrity';
    END IF;

    RAISE NOTICE '0049 verified: owner finance names and active-invoice filtering are correct.';
END;
$$;
