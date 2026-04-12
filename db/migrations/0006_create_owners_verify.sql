-- ============================================================================
-- Verification Script for: 0006_create_owners
-- Ticket: DB-MD-06
-- ============================================================================

-- 1. Verify table structure — exactly 10 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'owners'
ORDER BY ordinal_position;
-- Expected: 10 rows

-- 2. Verify check constraints
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'owners'::regclass
  AND contype = 'c';
-- Expected: ck_owners_commission_rate, ck_owners_status

-- 3. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'owners'
  AND indexname IN ('ux_owners_phone', 'ux_owners_email_not_null')
ORDER BY indexname;
-- Expected: 2 rows

-- 4. Insert valid owner
INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
VALUES ('Valid Owner', '+201000000010', 'owner1@example.com', 20.00, 'active', NOW(), NOW());

-- 5. Insert owner with commission_rate < 0 — should FAIL
DO $$
BEGIN
    INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
    VALUES ('Negative Comm', '+201000000011', NULL, -1.00, 'active', NOW(), NOW());
    RAISE NOTICE 'FAIL: Negative commission rate should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative commission rate correctly rejected (check_violation)';
END;
$$;

-- 6. Insert owner with commission_rate > 100 — should FAIL
DO $$
BEGIN
    INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
    VALUES ('Too High Comm', '+201000000012', NULL, 120.00, 'active', NOW(), NOW());
    RAISE NOTICE 'FAIL: Commission rate > 100 should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Commission rate > 100 correctly rejected (check_violation)';
END;
$$;

-- 7. Insert owner with invalid status — should FAIL
DO $$
BEGIN
    INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
    VALUES ('Blocked Status', '+201000000013', NULL, 15.00, 'blocked', NOW(), NOW());
    RAISE NOTICE 'FAIL: Invalid status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid status correctly rejected (check_violation)';
END;
$$;

-- 8. Insert duplicate phone — should FAIL
DO $$
BEGIN
    INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
    VALUES ('Duplicate Phone', '+201000000010', 'diff_email@example.com', 15.00, 'active', NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate phone should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate phone correctly rejected (unique_violation)';
END;
$$;

-- 9. Insert duplicate email (case-insensitive) — should FAIL
DO $$
BEGIN
    INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
    VALUES ('Duplicate Email', '+201000000014', 'OWNER1@example.com', 15.00, 'active', NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate email should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate email correctly rejected (unique_violation)';
END;
$$;

-- 10. Insert two null emails - should SUCCEED
INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
VALUES ('Null Email 1', '+201000000015', NULL, 10.00, 'active', NOW(), NOW());
INSERT INTO owners (name, phone, email, commission_rate, status, created_at, updated_at)
VALUES ('Null Email 2', '+201000000016', NULL, 10.00, 'active', NOW(), NOW());

-- 11. Soft delete test (set deleted_at)
UPDATE owners SET deleted_at = NOW() WHERE phone = '+201000000015';

SELECT name, deleted_at IS NOT NULL AS is_soft_deleted
FROM owners
WHERE phone = '+201000000015';
-- Expected is_soft_deleted = t

-- 12. Cleanup
DELETE FROM owners;

-- ============================================================================
-- If all checks pass → Migration 0006 is VERIFIED ✓
-- ============================================================================
