-- ============================================================================
-- Verification Script for: 0012_create_unit_amenities
-- Ticket: DB-UA-03
-- ============================================================================

-- =====================
-- STATIC VERIFICATION
-- =====================

-- 1. Verify table structure — exactly 3 columns (no id column)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'unit_amenities'
ORDER BY ordinal_position;
-- Expected: 3 rows (unit_id, amenity_id, created_at)

-- 2. Verify NO surrogate id column exists
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'unit_amenities'
      AND column_name = 'id';
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Found surrogate id column in unit_amenities — composite PK should be the only key!';
    ELSE
        RAISE NOTICE 'PASS: No surrogate id column found (composite PK is the uniqueness contract)';
    END IF;
END;
$$;

-- 3. Verify composite primary key exists with correct name
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'unit_amenities'::regclass
  AND contype = 'p'
ORDER BY conname;
-- Expected: pk_unit_amenities PRIMARY KEY (unit_id, amenity_id)

-- 4. Verify foreign key constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'unit_amenities'::regclass
  AND contype = 'f'
ORDER BY conname;
-- Expected: fk_unit_amenities_amenity_id, fk_unit_amenities_unit_id

-- 5. Verify index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'unit_amenities'
  AND indexname = 'ix_unit_amenities_amenity_id'
ORDER BY indexname;
-- Expected: 1 row

-- 6. Verify NO obsolete guest/unit_guest tables exist
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('unit_guest', 'guest');
    IF v_count > 0 THEN
        RAISE NOTICE 'WARNING: Obsolete guest/unit_guest table(s) found — should be cleaned up';
    ELSE
        RAISE NOTICE 'PASS: No obsolete guest/unit_guest tables found';
    END IF;
END;
$$;


-- =====================
-- RUNTIME VERIFICATION
-- =====================

-- Create parent rows for FK tests
INSERT INTO owners (id, name, phone, commission_rate, status, password_hash, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000012', 'Test Owner UA03', '+200000000012', 15.00, 'active',
        '$2a$12$testhashdummyvalue000000000000000000000000000000000000', NOW(), NOW());

INSERT INTO areas (id, name, is_active, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000012', 'Test Area UA03', TRUE, NOW(), NOW());

INSERT INTO units (id, owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012',
        'b0000000-0000-0000-0000-000000000012', 'Test Unit UA03', 'villa', 3, 2, 6, 800.00, NOW(), NOW());

INSERT INTO amenities (id, name, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000012', 'Test Pool UA03', NOW(), NOW());

INSERT INTO amenities (id, name, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000013', 'Test Sea View UA03', NOW(), NOW());


-- 7. Insert valid link => success
DO $$
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', NOW());
    RAISE NOTICE 'PASS: Valid unit-amenity link inserted successfully';
END;
$$;

-- 8. Insert second link (same unit, different amenity) => success
DO $$
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000013', NOW());
    RAISE NOTICE 'PASS: Second unit-amenity link inserted successfully';
END;
$$;

-- 9. Insert duplicate (same unit_id + amenity_id) => should FAIL
DO $$
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', NOW());
    RAISE NOTICE 'FAIL: Duplicate unit-amenity pair should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate unit-amenity pair correctly rejected (unique_violation via composite PK)';
END;
$$;

-- 10. Insert with invalid unit_id => should FAIL
DO $$
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES ('deadbeef-dead-dead-dead-deaddeaddead', 'd0000000-0000-0000-0000-000000000012', NOW());
    RAISE NOTICE 'FAIL: Non-existing unit_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing unit_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 11. Insert with invalid amenity_id => should FAIL
DO $$
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000012', 'deadbeef-dead-dead-dead-deaddeaddead', NOW());
    RAISE NOTICE 'FAIL: Non-existing amenity_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing amenity_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 12. Verify ON DELETE CASCADE from units side — delete unit, links should vanish
DO $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM units WHERE id = 'c0000000-0000-0000-0000-000000000012';
    SELECT COUNT(*) INTO v_count FROM unit_amenities WHERE unit_id = 'c0000000-0000-0000-0000-000000000012';
    IF v_count = 0 THEN
        RAISE NOTICE 'PASS: ON DELETE CASCADE (unit side) — links removed when unit deleted';
    ELSE
        RAISE NOTICE 'FAIL: Links still exist after unit deletion! Count: %', v_count;
    END IF;
END;
$$;

-- Re-create unit for amenity cascade test
INSERT INTO units (id, owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012',
        'b0000000-0000-0000-0000-000000000012', 'Test Unit UA03', 'villa', 3, 2, 6, 800.00, NOW(), NOW());

INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
VALUES ('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', NOW());

-- 13. Verify ON DELETE CASCADE from amenities side — delete amenity, links should vanish
DO $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM amenities WHERE id = 'd0000000-0000-0000-0000-000000000012';
    SELECT COUNT(*) INTO v_count FROM unit_amenities WHERE amenity_id = 'd0000000-0000-0000-0000-000000000012';
    IF v_count = 0 THEN
        RAISE NOTICE 'PASS: ON DELETE CASCADE (amenity side) — links removed when amenity deleted';
    ELSE
        RAISE NOTICE 'FAIL: Links still exist after amenity deletion! Count: %', v_count;
    END IF;
END;
$$;


-- =====================
-- CLEANUP
-- =====================

DELETE FROM unit_amenities;
DELETE FROM units WHERE owner_id = 'a0000000-0000-0000-0000-000000000012';
DELETE FROM amenities WHERE id IN ('d0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000013');
DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000012';
DELETE FROM areas  WHERE id = 'b0000000-0000-0000-0000-000000000012';

-- ============================================================================
-- If all checks pass → Migration 0012 is VERIFIED ✓
-- ============================================================================
