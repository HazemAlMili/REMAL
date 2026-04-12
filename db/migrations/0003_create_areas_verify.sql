-- ============================================================================
-- Verification Script for: 0003_create_areas
-- Ticket: DB-MD-03
-- ============================================================================

-- 1. Verify table structure — exactly 6 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'areas'
ORDER BY ordinal_position;
-- Expected: 6 rows (id, name, description, is_active, created_at, updated_at)

-- 2. Verify unique index exists on name
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'areas'
  AND indexname = 'ux_areas_name';
-- Expected: 1 row

-- 3. Insert Palm Hills — should succeed
INSERT INTO areas (name, description, created_at, updated_at)
VALUES ('Palm Hills', 'Premium resort area', NOW(), NOW());

-- 4. Insert Abraj Al Alamein — should succeed
INSERT INTO areas (name, description, created_at, updated_at)
VALUES ('Abraj Al Alamein', 'Coastal towers', NOW(), NOW());

-- 5. Insert duplicate Palm Hills — should FAIL
DO $$
BEGIN
    INSERT INTO areas (name, description, created_at, updated_at)
    VALUES ('Palm Hills', 'Duplicate test', NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate insert should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate name correctly rejected (unique_violation)';
END;
$$;

-- 6. Insert area without description (NULL) — should succeed
INSERT INTO areas (name, created_at, updated_at)
VALUES ('North Coast', NOW(), NOW());

-- 7. Insert area with is_active = false — should succeed
INSERT INTO areas (name, is_active, created_at, updated_at)
VALUES ('Inactive Zone', FALSE, NOW(), NOW());

-- 8. Verify is_active defaults to TRUE (check North Coast)
SELECT name, is_active
FROM areas
WHERE name = 'North Coast';
-- Expected: is_active = true

-- 9. Verify is_active = false was stored correctly
SELECT name, is_active
FROM areas
WHERE name = 'Inactive Zone';
-- Expected: is_active = false

-- 10. Verify all rows
SELECT id, name, description, is_active, created_at, updated_at FROM areas ORDER BY name;
-- Expected: 4 rows

-- 11. Verify column count (no extras like deleted_at, slug, image_url)
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'areas';
-- Expected: 6

-- 12. Clean up test data
DELETE FROM areas;

-- ============================================================================
-- If all checks pass → Migration 0003 is VERIFIED ✓
-- ============================================================================
