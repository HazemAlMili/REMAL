-- ============================================================================
-- Verification Script for: 0014_create_date_blocks
-- Ticket: DB-UA-05
-- ============================================================================

-- =====================
-- STATIC VERIFICATION
-- =====================

-- 1. Verify table structure — exactly 8 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'date_blocks'
ORDER BY ordinal_position;
-- Expected: 8 rows (id, unit_id, start_date, end_date, reason, notes, created_at, updated_at)

-- 2. Verify NO booking or availability speculative columns exist
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'date_blocks'
      AND column_name IN ('booking_id', 'availability_status', 'is_available', 'approved_by',
                           'created_by_admin_id', 'blocked_by', 'deleted_at');
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Found forbidden speculative column(s) in date_blocks table!';
    ELSE
        RAISE NOTICE 'PASS: No booking/availability/audit speculative columns found';
    END IF;
END;
$$;

-- 3. Verify check constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'date_blocks'::regclass
  AND contype = 'c'
ORDER BY conname;
-- Expected: ck_date_blocks_valid_date_range

-- 4. Verify foreign key constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'date_blocks'::regclass
  AND contype = 'f'
ORDER BY conname;
-- Expected: fk_date_blocks_unit_id with ON DELETE CASCADE

-- 5. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'date_blocks'
  AND indexname IN ('ix_date_blocks_unit_id', 'ix_date_blocks_unit_id_date_range')
ORDER BY indexname;
-- Expected: 2 rows


-- =====================
-- RUNTIME VERIFICATION
-- =====================

-- Create parent rows for FK tests
INSERT INTO owners (id, name, phone, commission_rate, status, password_hash, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000014', 'Test Owner UA05', '+200000000014', 15.00, 'active',
        '$2a$12$testhashdummyvalue000000000000000000000000000000000000', NOW(), NOW());

INSERT INTO areas (id, name, is_active, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000014', 'Test Area UA05', TRUE, NOW(), NOW());

INSERT INTO units (id, owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000014',
        'b0000000-0000-0000-0000-000000000014', 'Test Unit UA05', 'apartment', 2, 1, 4, 350.00, NOW(), NOW());


-- 6. Insert valid date block with reason => success
DO $$
BEGIN
    INSERT INTO date_blocks (unit_id, start_date, end_date, reason, notes, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000014',
        '2026-08-01', '2026-08-07',
        'maintenance',
        'Painting and repairs',
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Valid date block with reason inserted successfully';
END;
$$;

-- 7. Insert valid date block without reason (NULL) => success
DO $$
BEGIN
    INSERT INTO date_blocks (unit_id, start_date, end_date, reason, notes, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000014',
        '2026-09-15', '2026-09-20',
        NULL,
        NULL,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Date block with NULL reason inserted successfully';
END;
$$;

-- 8. Insert single-day block (start = end) => success
DO $$
BEGIN
    INSERT INTO date_blocks (unit_id, start_date, end_date, reason, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000014',
        '2026-12-25', '2026-12-25',
        'owner use',
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Single-day date block inserted successfully';
END;
$$;

-- 9. Insert invalid date range (end before start) => should FAIL
DO $$
BEGIN
    INSERT INTO date_blocks (unit_id, start_date, end_date, reason, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000014',
        '2026-10-15', '2026-10-01',
        'bad range',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: end_date before start_date should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: end_date before start_date correctly rejected (check_violation)';
END;
$$;

-- 10. Insert with non-existing unit_id => should FAIL
DO $$
BEGIN
    INSERT INTO date_blocks (unit_id, start_date, end_date, reason, created_at, updated_at)
    VALUES (
        'deadbeef-dead-dead-dead-deaddeaddead',
        '2026-08-01', '2026-08-07',
        'fake unit',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Non-existing unit_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing unit_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 11. Verify ON DELETE CASCADE — delete unit, blocks should vanish
DO $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM units WHERE id = 'c0000000-0000-0000-0000-000000000014';
    SELECT COUNT(*) INTO v_count FROM date_blocks WHERE unit_id = 'c0000000-0000-0000-0000-000000000014';
    IF v_count = 0 THEN
        RAISE NOTICE 'PASS: ON DELETE CASCADE — date blocks removed when unit deleted';
    ELSE
        RAISE NOTICE 'FAIL: Date blocks still exist after unit deletion! Count: %', v_count;
    END IF;
END;
$$;


-- =====================
-- CLEANUP
-- =====================

DELETE FROM date_blocks;
DELETE FROM units WHERE owner_id = 'a0000000-0000-0000-0000-000000000014';
DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000014';
DELETE FROM areas  WHERE id = 'b0000000-0000-0000-0000-000000000014';

-- ============================================================================
-- If all checks pass → Migration 0014 is VERIFIED ✓
-- ============================================================================
