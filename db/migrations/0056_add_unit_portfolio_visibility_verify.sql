-- Verify: 0056_add_unit_portfolio_visibility
-- Purpose: Confirm units.is_visible_in_portfolio is safe for production rollout.

DO $$
DECLARE
    v_data_type TEXT;
    v_is_nullable TEXT;
    v_column_default TEXT;
BEGIN
    SELECT data_type, is_nullable, column_default
    INTO v_data_type, v_is_nullable, v_column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'units'
      AND column_name = 'is_visible_in_portfolio';

    IF v_data_type IS NULL THEN
        RAISE EXCEPTION 'Column public.units.is_visible_in_portfolio does not exist';
    END IF;

    IF v_data_type <> 'boolean' THEN
        RAISE EXCEPTION 'units.is_visible_in_portfolio type is %, expected boolean', v_data_type;
    END IF;

    IF v_is_nullable <> 'NO' THEN
        RAISE EXCEPTION 'units.is_visible_in_portfolio must be NOT NULL';
    END IF;

    IF COALESCE(v_column_default, '') NOT IN ('true', 'true::boolean') THEN
        RAISE EXCEPTION
            'units.is_visible_in_portfolio default is %, expected true',
            COALESCE(v_column_default, '<none>');
    END IF;

    IF EXISTS (SELECT 1 FROM units WHERE is_visible_in_portfolio IS NULL) THEN
        RAISE EXCEPTION 'units contains NULL is_visible_in_portfolio values';
    END IF;

    IF to_regclass('public.ix_units_public_portfolio') IS NULL THEN
        RAISE EXCEPTION 'Missing index public.ix_units_public_portfolio';
    END IF;

    RAISE NOTICE '0056 verified: unit portfolio visibility is boolean NOT NULL DEFAULT true.';
END $$;
