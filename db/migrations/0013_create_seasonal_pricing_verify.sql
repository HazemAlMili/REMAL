-- ============================================================================
-- Verification Script for: 0013_create_seasonal_pricing
-- Ticket: DB-UA-04
-- ============================================================================

-- =====================
-- STATIC VERIFICATION
-- =====================

-- 1. Verify table structure — exactly 7 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'seasonal_pricing'
ORDER BY ordinal_position;
-- Expected: 7 rows (id, unit_id, start_date, end_date, price_per_night, created_at, updated_at)

-- 2. Verify NO derived pricing columns exist
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'seasonal_pricing'
      AND column_name IN ('total_price', 'booking_total', 'tax_amount', 'discount_amount', 'currency', 'label');
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Found forbidden derived pricing column(s) in seasonal_pricing table!';
    ELSE
        RAISE NOTICE 'PASS: No derived pricing columns found';
    END IF;
END;
$$;

-- 3. Verify check constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'seasonal_pricing'::regclass
  AND contype = 'c'
ORDER BY conname;
-- Expected: ck_seasonal_pricing_price_non_negative, ck_seasonal_pricing_valid_date_range

-- 4. Verify foreign key constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'seasonal_pricing'::regclass
  AND contype = 'f'
ORDER BY conname;
-- Expected: fk_seasonal_pricing_unit_id with ON DELETE CASCADE

-- 5. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'seasonal_pricing'
  AND indexname IN ('ix_seasonal_pricing_unit_id', 'ix_seasonal_pricing_unit_id_date_range')
ORDER BY indexname;
-- Expected: 2 rows

-- 6. Verify NO exclusion constraint exists (intentionally deferred)
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_constraint
    WHERE conrelid = 'seasonal_pricing'::regclass
      AND contype = 'x';
    IF v_count > 0 THEN
        RAISE NOTICE 'WARNING: Exclusion constraint found — should be deferred to Business tier!';
    ELSE
        RAISE NOTICE 'PASS: No exclusion constraint (overlap prevention deferred to Business tier)';
    END IF;
END;
$$;


-- =====================
-- RUNTIME VERIFICATION
-- =====================

-- Create parent rows for FK tests
INSERT INTO owners (id, name, phone, commission_rate, status, password_hash, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000013', 'Test Owner UA04', '+200000000013', 15.00, 'active',
        '$2a$12$testhashdummyvalue000000000000000000000000000000000000', NOW(), NOW());

INSERT INTO areas (id, name, is_active, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000013', 'Test Area UA04', TRUE, NOW(), NOW());

INSERT INTO units (id, owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013',
        'b0000000-0000-0000-0000-000000000013', 'Test Unit UA04', 'chalet', 2, 1, 6, 500.00, NOW(), NOW());


-- 7. Insert valid seasonal pricing row => success
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000013',
        '2026-07-01', '2026-08-31',
        750.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Valid seasonal pricing row inserted successfully';
END;
$$;

-- 8. Insert with same start and end date (single day) => success
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000013',
        '2026-12-25', '2026-12-25',
        1200.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Single-day seasonal pricing row inserted successfully';
END;
$$;

-- 9. Insert with end_date before start_date => should FAIL
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000013',
        '2026-09-15', '2026-09-01',
        600.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: end_date before start_date should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: end_date before start_date correctly rejected (check_violation)';
END;
$$;

-- 10. Insert negative price_per_night => should FAIL
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000013',
        '2026-10-01', '2026-10-31',
        -50.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Negative price_per_night should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative price_per_night correctly rejected (check_violation)';
END;
$$;

-- 11. Insert with zero price (free promo) => should SUCCEED
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000013',
        '2026-11-01', '2026-11-07',
        0.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Zero price_per_night accepted (free promo)';
END;
$$;

-- 12. Insert with invalid unit_id => should FAIL
DO $$
BEGIN
    INSERT INTO seasonal_pricing (unit_id, start_date, end_date, price_per_night, created_at, updated_at)
    VALUES (
        'deadbeef-dead-dead-dead-deaddeaddead',
        '2026-07-01', '2026-07-31',
        500.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Non-existing unit_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing unit_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 13. Verify ON DELETE CASCADE — delete unit, pricing rows should vanish
DO $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM units WHERE id = 'c0000000-0000-0000-0000-000000000013';
    SELECT COUNT(*) INTO v_count FROM seasonal_pricing WHERE unit_id = 'c0000000-0000-0000-0000-000000000013';
    IF v_count = 0 THEN
        RAISE NOTICE 'PASS: ON DELETE CASCADE — seasonal pricing removed when unit deleted';
    ELSE
        RAISE NOTICE 'FAIL: Seasonal pricing still exists after unit deletion! Count: %', v_count;
    END IF;
END;
$$;


-- =====================
-- CLEANUP
-- =====================

DELETE FROM seasonal_pricing;
DELETE FROM units WHERE owner_id = 'a0000000-0000-0000-0000-000000000013';
DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000013';
DELETE FROM areas  WHERE id = 'b0000000-0000-0000-0000-000000000013';

-- ============================================================================
-- If all checks pass → Migration 0013 is VERIFIED ✓
-- ============================================================================
