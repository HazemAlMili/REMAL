-- ============================================================================
-- Verification Script for: 0004_create_admin_users
-- Ticket: DB-MD-04
-- ============================================================================

-- 1. Verify table structure — exactly 8 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_users'
ORDER BY ordinal_position;
-- Expected: 8 rows

-- 2. Verify unique index on LOWER(email)
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'admin_users'
  AND indexname = 'ux_admin_users_email';
-- Expected: 1 row, indexdef contains lower(email)

-- 3. Verify check constraint on role
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'admin_users'::regclass
  AND contype = 'c';
-- Expected: ck_admin_users_role with role IN (...)

-- 4. Insert valid admin with role = sales — should succeed
INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Ahmed Sales', 'ahmed@example.com', '$2b$12$fakehashvalue', 'sales', NOW(), NOW());

-- 5. Insert admin with invalid role = manager — should FAIL
DO $$
BEGIN
    INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
    VALUES ('Bad Role', 'bad@example.com', '$2b$12$fakehash', 'manager', NOW(), NOW());
    RAISE NOTICE 'FAIL: Invalid role should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid role correctly rejected (check_violation)';
END;
$$;

-- 6. Insert with email ADMIN@example.com — should succeed
INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Admin Upper', 'ADMIN@example.com', '$2b$12$fakehash', 'super_admin', NOW(), NOW());

-- 7. Insert with email admin@example.com (same email, different case) — should FAIL
DO $$
BEGIN
    INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
    VALUES ('Admin Lower', 'admin@example.com', '$2b$12$fakehash', 'tech', NOW(), NOW());
    RAISE NOTICE 'FAIL: Case-insensitive duplicate should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Case-insensitive duplicate email correctly rejected (unique_violation)';
END;
$$;

-- 8. Insert all 4 valid roles — verify each is accepted
INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Finance User', 'finance@example.com', '$2b$12$fakehash', 'finance', NOW(), NOW());

INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Tech User', 'tech@example.com', '$2b$12$fakehash', 'tech', NOW(), NOW());

-- 9. Insert without specifying is_active — should default to TRUE
INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at)
VALUES ('Default Active', 'default@example.com', '$2b$12$fakehash', 'sales', NOW(), NOW());

SELECT name, is_active
FROM admin_users
WHERE email = 'default@example.com';
-- Expected: is_active = true

-- 10. Verify all rows
SELECT id, name, email, role, is_active, created_at, updated_at FROM admin_users ORDER BY email;
-- Expected: 5 rows

-- 11. Verify column count (no deleted_at, username, permissions, etc.)
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_users';
-- Expected: 8

-- 12. Clean up test data
DELETE FROM admin_users;

-- ============================================================================
-- If all checks pass → Migration 0004 is VERIFIED ✓
-- ============================================================================
