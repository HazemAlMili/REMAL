-- Verify:      0050_add_amenity_is_active
-- Purpose:     Confirm amenities.is_active is a non-null boolean that defaults
--              to true for existing and newly-created amenities.

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
      AND table_name = 'amenities'
      AND column_name = 'is_active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Column public.amenities.is_active does not exist';
    END IF;

    IF v_data_type <> 'boolean' THEN
        RAISE EXCEPTION 'amenities.is_active type is %, expected boolean', v_data_type;
    END IF;

    IF v_is_nullable <> 'NO' THEN
        RAISE EXCEPTION 'amenities.is_active must be NOT NULL';
    END IF;

    IF COALESCE(lower(replace(v_column_default, '::boolean', '')), '') <> 'true' THEN
        RAISE EXCEPTION
            'amenities.is_active default is %, expected true',
            v_column_default;
    END IF;

    IF EXISTS (SELECT 1 FROM amenities WHERE is_active IS NULL) THEN
        RAISE EXCEPTION 'amenities contains a NULL is_active value';
    END IF;

    RAISE NOTICE '0050 verified: amenities.is_active is boolean NOT NULL DEFAULT true.';
END;
$$;
