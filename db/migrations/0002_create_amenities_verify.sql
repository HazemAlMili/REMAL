-- ============================================================================
-- Verification Script for: 0002_create_amenities
-- Ticket: DB-MD-02
-- ============================================================================
-- Run this AFTER applying migrations 0001 + 0002.
-- ============================================================================

-- 1. Verify table exists with exactly 5 columns
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'amenities'
ORDER BY ordinal_position;
-- Expected: 5 rows (id, name, icon, created_at, updated_at)

-- 2. Verify unique index exists on name
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'amenities'
  AND indexname = 'ux_amenities_name';
-- Expected: 1 row

-- 3. Insert valid row — should succeed
INSERT INTO amenities (name, icon, created_at, updated_at)
VALUES ('Pool', NULL, NOW(), NOW());

-- 4. Insert duplicate name — should FAIL
-- (wrapped in DO block to catch error gracefully)
DO $$
BEGIN
    INSERT INTO amenities (name, icon, created_at, updated_at)
    VALUES ('Pool', NULL, NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate insert should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate name correctly rejected (unique_violation)';
END;
$$;

-- 5. Insert another valid row with different name — should succeed
INSERT INTO amenities (name, icon, created_at, updated_at)
VALUES ('Sea View', 'sea-view-icon', NOW(), NOW());

-- 6. Verify both rows exist
SELECT id, name, icon, created_at, updated_at FROM amenities ORDER BY name;
-- Expected: 2 rows (Pool + Sea View)

-- 7. Verify no extra columns (deleted_at, is_active, etc.)
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'amenities';
-- Expected: 5

-- 8. Clean up test data
DELETE FROM amenities;

-- ============================================================================
-- If all checks pass → Migration 0002 is VERIFIED ✓
-- ============================================================================
