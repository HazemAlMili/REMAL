-- ============================================================================
-- Verification Script for: 0015_units_availability_integrity_cleanup
-- Ticket: DB-UA-06
-- Purpose: Comprehensive Domain schema contract verification
-- ============================================================================

-- =====================
-- CROSS-TABLE INTEGRITY CHECKS
-- =====================

DO $$
DECLARE
    v_count INT;
BEGIN
    RAISE NOTICE '--- STARTING UNITS & AVAILABILITY DOMAIN QUALITY GATE ---';

    -- ---------------------------------------------------------
    -- 1. UNITS CHECKS
    -- ---------------------------------------------------------
    -- 1.1 Has owner_id and area_id
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'units' AND column_name IN ('owner_id', 'area_id');
    IF v_count <> 2 THEN RAISE EXCEPTION 'FAIL: units missing owner_id or area_id'; END IF;
    
    -- 1.2 Has deleted_at
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'deleted_at';
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL: units missing deleted_at'; END IF;
    
    -- 1.3 No availability field
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'units' AND column_name IN ('is_available', 'availability_status', 'blocked_until');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: units has forbidden availability fields'; END IF;
    
    -- 1.4 base_price_per_night is decimal
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'base_price_per_night' AND data_type IN ('numeric', 'decimal');
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL: units base_price_per_night is not decimal/numeric'; END IF;
    
    RAISE NOTICE 'PASS: units table matches all domain rules.';

    -- ---------------------------------------------------------
    -- 2. UNIT_IMAGES CHECKS
    -- ---------------------------------------------------------
    -- 2.1 Linked to units
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'unit_images'::regclass AND contype = 'f';
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL: unit_images FK constraint count mismatch'; END IF;
    
    -- 2.2 display_order non-negative exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'unit_images'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%display_order%';
    IF v_count = 0 THEN RAISE EXCEPTION 'FAIL: unit_images missing display_order check'; END IF;
    
    -- 2.3 No provider fields
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'unit_images' AND column_name IN ('public_url', 'mime_type', 'file_size', 'alt_text');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: unit_images has speculative provider fields'; END IF;
    
    RAISE NOTICE 'PASS: unit_images table matches all domain rules.';

    -- ---------------------------------------------------------
    -- 3. UNIT_AMENITIES CHECKS
    -- ---------------------------------------------------------
    -- 3.1 Composite PK exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'unit_amenities'::regclass AND contype = 'p' AND pg_get_constraintdef(oid) ILIKE '%unit_id, amenity_id%';
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL: unit_amenities composite PK missing or incorrect'; END IF;
    
    -- 3.2 No surrogate id
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'unit_amenities' AND column_name = 'id';
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: unit_amenities has surrogate id'; END IF;
    
    -- 3.3 No obsolete guest naming
    SELECT COUNT(*) INTO v_count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('guest', 'unit_guest');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: Obsolete guest/unit_guest tables found'; END IF;
    
    RAISE NOTICE 'PASS: unit_amenities table matches all domain rules.';

    -- ---------------------------------------------------------
    -- 4. SEASONAL_PRICING CHECKS
    -- ---------------------------------------------------------
    -- 4.1 Date range check exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'seasonal_pricing'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%start_date <= end_date%';
    IF v_count = 0 THEN RAISE EXCEPTION 'FAIL: seasonal_pricing missing date range check'; END IF;
    
    -- 4.2 Non-negative price exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'seasonal_pricing'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%price_per_night >=%';
    IF v_count = 0 THEN RAISE EXCEPTION 'FAIL: seasonal_pricing missing price non-negative check'; END IF;
    
    -- 4.3 No derived totals
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'seasonal_pricing' AND column_name IN ('total_price', 'tax_amount', 'discount_amount');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: seasonal_pricing has derived totals'; END IF;
    
    -- 4.4 No exclusion constraints
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'seasonal_pricing'::regclass AND contype = 'x';
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: seasonal_pricing has exclusion constraints (should be left to Business Tier)'; END IF;
    
    RAISE NOTICE 'PASS: seasonal_pricing table matches all domain rules.';

    -- ---------------------------------------------------------
    -- 5. DATE_BLOCKS CHECKS
    -- ---------------------------------------------------------
    -- 5.1 Unit FK exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'date_blocks'::regclass AND contype = 'f';
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL: date_blocks FK constraint count mismatch'; END IF;
    
    -- 5.2 Date range check exists
    SELECT COUNT(*) INTO v_count FROM pg_constraint WHERE conrelid = 'date_blocks'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%start_date <= end_date%';
    IF v_count = 0 THEN RAISE EXCEPTION 'FAIL: date_blocks missing date range check'; END IF;
    
    -- 5.3 No booking_id
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'date_blocks' AND column_name = 'booking_id';
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: date_blocks has booking_id'; END IF;
    
    -- 5.4 No availability storage
    SELECT COUNT(*) INTO v_count FROM information_schema.columns WHERE table_name = 'date_blocks' AND column_name IN ('is_available', 'availability_status', 'blocked_by');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: date_blocks has availability storage columns'; END IF;
    
    RAISE NOTICE 'PASS: date_blocks table matches all domain rules.';

    -- ---------------------------------------------------------
    -- 6. GLOBAL DOMAIN CHECKS
    -- ---------------------------------------------------------
    -- 6.1 No stored availability field ANYWHERE in domain
    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_name IN ('units', 'unit_images', 'unit_amenities', 'seasonal_pricing', 'date_blocks')
      AND column_name ILIKE '%availabilit%' OR column_name ILIKE 'is_available';
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: Found availability fields somewhere in the domain'; END IF;

    -- 6.2 No booking-related columns ANYWHERE in domain
    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_name IN ('units', 'unit_images', 'unit_amenities', 'seasonal_pricing', 'date_blocks')
      AND column_name ILIKE '%booking%';
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: Found booking fields somewhere in the domain'; END IF;

    -- 6.3 All money fields use numeric/decimal (no float/real)
    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_name IN ('units', 'seasonal_pricing')
      AND column_name ILIKE '%price%'
      AND data_type NOT IN ('numeric', 'decimal');
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: Found price fields using non-decimal types'; END IF;

    -- 6.4 Naming check (Ensure no camelCase tables/columns)
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name IN ('units', 'unit_images', 'unit_amenities', 'seasonal_pricing', 'date_blocks')
    AND column_name <> lower(column_name);
    IF v_count > 0 THEN RAISE EXCEPTION 'FAIL: Found camelCase columns, expected snake_case'; END IF;

    RAISE NOTICE 'PASS: GLOBAL DOMAIN checks (No availability leakage, No booking leakage, Decimal money, strict snake_case).';
    
    RAISE NOTICE '--- UNITS & AVAILABILITY DOMAIN QUALITY GATE PASSED SUCCESSULLY ---';

END;
$$;
