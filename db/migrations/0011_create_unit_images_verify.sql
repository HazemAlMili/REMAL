-- ============================================================================
-- Verification Script for: 0011_create_unit_images
-- Ticket: DB-UA-02
-- ============================================================================

-- =====================
-- STATIC VERIFICATION
-- =====================

-- 1. Verify table structure — exactly 7 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'unit_images'
ORDER BY ordinal_position;
-- Expected: 7 rows (id, unit_id, file_key, is_cover, display_order, created_at, updated_at)

-- 2. Verify NO speculative media columns exist
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'unit_images'
      AND column_name IN ('public_url', 'thumbnail_url', 'mime_type', 'file_size', 'alt_text', 'deleted_at');
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Found forbidden speculative media column(s) in unit_images table!';
    ELSE
        RAISE NOTICE 'PASS: No speculative media columns found';
    END IF;
END;
$$;

-- 3. Verify check constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'unit_images'::regclass
  AND contype = 'c'
ORDER BY conname;
-- Expected: ck_unit_images_display_order_non_negative

-- 4. Verify foreign key constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'unit_images'::regclass
  AND contype = 'f'
ORDER BY conname;
-- Expected: fk_unit_images_unit_id with ON DELETE CASCADE

-- 5. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'unit_images'
  AND indexname IN ('ix_unit_images_unit_id', 'ix_unit_images_unit_id_display_order')
ORDER BY indexname;
-- Expected: 2 rows


-- =====================
-- RUNTIME VERIFICATION
-- =====================

-- We need a valid unit (which needs owner + area) for FK tests.
INSERT INTO owners (id, name, phone, commission_rate, status, password_hash, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000011', 'Test Owner UA02', '+200000000011', 15.00, 'active',
        '$2a$12$testhashdummyvalue000000000000000000000000000000000000', NOW(), NOW());

INSERT INTO areas (id, name, is_active, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000011', 'Test Area UA02', TRUE, NOW(), NOW());

INSERT INTO units (id, owner_id, area_id, name, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011',
        'b0000000-0000-0000-0000-000000000011', 'Test Unit UA02', 'apartment', 2, 1, 4, 350.00, NOW(), NOW());


-- 6. Insert valid image => success
DO $$
BEGIN
    INSERT INTO unit_images (unit_id, file_key, is_cover, display_order, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000011',
        'units/c0000000/image1.webp',
        TRUE,
        0,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Valid image row inserted successfully';
END;
$$;

-- 7. Insert second image with different order => success
DO $$
BEGIN
    INSERT INTO unit_images (unit_id, file_key, is_cover, display_order, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000011',
        'units/c0000000/image2.webp',
        FALSE,
        1,
        NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Second image row inserted successfully';
END;
$$;

-- 8. Insert image with invalid unit_id => should FAIL
DO $$
BEGIN
    INSERT INTO unit_images (unit_id, file_key, display_order, created_at, updated_at)
    VALUES (
        'deadbeef-dead-dead-dead-deaddeaddead',
        'units/fake/image.webp',
        0,
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Non-existing unit_id should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Non-existing unit_id correctly rejected (foreign_key_violation)';
END;
$$;

-- 9. Insert image with display_order = -1 => should FAIL
DO $$
BEGIN
    INSERT INTO unit_images (unit_id, file_key, display_order, created_at, updated_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000011',
        'units/c0000000/bad_order.webp',
        -1,
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Negative display_order should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative display_order correctly rejected (check_violation)';
END;
$$;

-- 10. Verify is_cover defaults to FALSE
DO $$
DECLARE
    v_cover BOOLEAN;
BEGIN
    INSERT INTO unit_images (id, unit_id, file_key, display_order, created_at, updated_at)
    VALUES (
        'd0000000-0000-0000-0000-000000000011',
        'c0000000-0000-0000-0000-000000000011',
        'units/c0000000/default_cover.webp',
        2,
        NOW(), NOW()
    );
    SELECT is_cover INTO v_cover FROM unit_images WHERE id = 'd0000000-0000-0000-0000-000000000011';
    IF v_cover = FALSE THEN
        RAISE NOTICE 'PASS: is_cover defaults to FALSE';
    ELSE
        RAISE NOTICE 'FAIL: is_cover did not default to FALSE!';
    END IF;
END;
$$;

-- 11. Verify display_order defaults to 0
DO $$
DECLARE
    v_order INT;
BEGIN
    INSERT INTO unit_images (id, unit_id, file_key, created_at, updated_at)
    VALUES (
        'e0000000-0000-0000-0000-000000000011',
        'c0000000-0000-0000-0000-000000000011',
        'units/c0000000/default_order.webp',
        NOW(), NOW()
    );
    SELECT display_order INTO v_order FROM unit_images WHERE id = 'e0000000-0000-0000-0000-000000000011';
    IF v_order = 0 THEN
        RAISE NOTICE 'PASS: display_order defaults to 0';
    ELSE
        RAISE NOTICE 'FAIL: display_order did not default to 0!';
    END IF;
END;
$$;

-- 12. Verify ON DELETE CASCADE — delete unit, images should vanish
DO $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM units WHERE id = 'c0000000-0000-0000-0000-000000000011';
    SELECT COUNT(*) INTO v_count FROM unit_images WHERE unit_id = 'c0000000-0000-0000-0000-000000000011';
    IF v_count = 0 THEN
        RAISE NOTICE 'PASS: ON DELETE CASCADE — all images removed when unit deleted';
    ELSE
        RAISE NOTICE 'FAIL: Images still exist after unit deletion! Count: %', v_count;
    END IF;
END;
$$;


-- =====================
-- CLEANUP
-- =====================

DELETE FROM unit_images;
DELETE FROM units WHERE owner_id = 'a0000000-0000-0000-0000-000000000011';
DELETE FROM owners WHERE id = 'a0000000-0000-0000-0000-000000000011';
DELETE FROM areas  WHERE id = 'b0000000-0000-0000-0000-000000000011';

-- ============================================================================
-- If all checks pass → Migration 0011 is VERIFIED ✓
-- ============================================================================
