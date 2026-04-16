-- ============================================================================
-- Verification Script for: 0010_create_units
-- Ticket: DB-UA-01
-- ============================================================================

-- =====================
-- STATIC VERIFICATION
-- =====================

-- 1. Verify table structure — exactly 15 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'units'
ORDER BY ordinal_position;
-- Expected: 15 rows (id, owner_id, area_id, name, description, address,
--   unit_type, bedrooms, bathrooms, max_guests, base_price_per_night,
--   is_active, created_at, updated_at, deleted_at)

-- 2. Verify NO availability storage column exists
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'units'
      AND column_name IN ('is_available', 'availability_status', 'blocked_until', 'availability');
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Found forbidden availability storage column(s) in units table!';
    ELSE
        RAISE NOTICE 'PASS: No availability storage columns found (availability is derived)';
    END IF;
END;
$$;

-- 3. Verify check constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'units'::regclass
  AND contype = 'c'
ORDER BY conname;
-- Expected: ck_units_base_price_non_negative, ck_units_bathrooms_non_negative,
--   ck_units_bedrooms_non_negative, ck_units_max_guests_positive, ck_units_unit_type

-- 4. Verify foreign key constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'units'::regclass
  AND contype = 'f'
ORDER BY conname;
-- Expected: fk_units_area_id, fk_units_owner_id

-- 5. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'units'
  AND indexname IN ('ix_units_owner_id', 'ix_units_area_id')
ORDER BY indexname;
-- Expected: 2 rows

-- 6. Verify deleted_at column exists and is nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'units'
  AND column_name = 'deleted_at';
-- Expected: 1 row, is_nullable = 'YES'


-- =====================
-- RUNTIME VERIFICATION
-- =====================

-- We need valid owner and area rows for FK tests.
-- Insert temporary parent rows.
INSERT INTO owners (id, name, phone, commission_rate, status, password_hash, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Test Owner UA01', '+200000000001', 15.00, 'active', '$2a$12$testhashdummyvalue000000000000000000000000000000000000', NOW(), NOW());

INSERT INTO areas (id, name, is_active, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000001', 'Test Area UA01', TRUE, NOW(), NOW());


-- 7. Insert valid unit row => success
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Valid Test Unit',
        'apartment',
        2, 1, 4,
        350.00,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Valid unit row inserted successfully';
END;
$$;

-- 8. Insert negative bedrooms => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Negative Bedrooms', 'villa', -1, 1, 4, 500.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Negative bedrooms should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative bedrooms correctly rejected (check_violation)';
END;
$$;

-- 9. Insert negative bathrooms => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Negative Bathrooms', 'chalet', 2, -1, 4, 500.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Negative bathrooms should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative bathrooms correctly rejected (check_violation)';
END;
$$;

-- 10. Insert max_guests = 0 => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Zero Guests', 'studio', 1, 1, 0, 200.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: max_guests = 0 should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: max_guests = 0 correctly rejected (check_violation)';
END;
$$;

-- 11. Insert negative base_price_per_night => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Negative Price', 'apartment', 1, 1, 2, -100.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Negative base_price_per_night should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative base_price_per_night correctly rejected (check_violation)';
END;
$$;

-- 12. Insert invalid unit_type => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Invalid Type', 'penthouse', 3, 2, 6, 800.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid unit_type should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid unit_type correctly rejected (check_violation)';
END;
$$;

-- 13. Insert with non-existing owner_id => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'deadbeef-dead-dead-dead-deaddeaddead',
        'b0000000-0000-0000-0000-000000000001',
        'Bad Owner FK', 'villa', 2, 1, 4, 500.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Non-existing owner_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing owner_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 14. Insert with non-existing area_id => should FAIL
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'deadbeef-dead-dead-dead-deaddeaddead',
        'Bad Area FK', 'chalet', 2, 1, 4, 500.00, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Non-existing area_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing area_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 15. Verify ON DELETE RESTRICT for owner — should FAIL
DO $$
BEGIN
    DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'FAIL: Deleting owner with linked units should have been restricted!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Owner deletion correctly restricted (foreign_key_violation)';
END;
$$;

-- 16. Verify ON DELETE RESTRICT for area — should FAIL
DO $$
BEGIN
    DELETE FROM areas WHERE id = 'b0000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'FAIL: Deleting area with linked units should have been restricted!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Area deletion correctly restricted (foreign_key_violation)';
END;
$$;

-- 17. Soft delete test
UPDATE units SET deleted_at = NOW() WHERE name = 'Valid Test Unit';
SELECT name, deleted_at IS NOT NULL AS is_soft_deleted
FROM units
WHERE name = 'Valid Test Unit';
-- Expected: is_soft_deleted = t

-- 18. Verify is_active defaults to TRUE
SELECT is_active
FROM units
WHERE name = 'Valid Test Unit';
-- Expected: is_active = true

-- 19. Verify all 4 allowed unit_type values work
DO $$
BEGIN
    INSERT INTO units (owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
    VALUES
        ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Type Villa',     'villa',     3, 2, 8, 1000.00, NOW(), NOW()),
        ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Type Chalet',    'chalet',    2, 1, 6, 750.00,  NOW(), NOW()),
        ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Type Studio',    'studio',    0, 1, 2, 250.00,  NOW(), NOW()),
        ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Type Apartment', 'apartment', 1, 1, 3, 400.00,  NOW(), NOW());
    RAISE NOTICE 'PASS: All 4 allowed unit_type values accepted';
END;
$$;


-- =====================
-- CLEANUP
-- =====================

DELETE FROM units;
DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM areas  WHERE id = 'b0000000-0000-0000-0000-000000000001';

-- ============================================================================
-- If all checks pass → Migration 0010 is VERIFIED ✓
-- ============================================================================
