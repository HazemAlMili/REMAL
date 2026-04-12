-- ============================================================================
-- Verification Script for: 0005_create_clients
-- Ticket: DB-MD-05
-- ============================================================================

-- 1. Verify table structure — exactly 9 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
ORDER BY ordinal_position;
-- Expected: 9 rows (id, name, phone, email, password_hash, is_active, created_at, updated_at, deleted_at)

-- 2. Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'clients'
  AND indexname IN ('ux_clients_phone', 'ux_clients_email_not_null')
ORDER BY indexname;
-- Expected: 2 rows

-- 3. Insert client with phone, email = NULL — should succeed
INSERT INTO clients (name, phone, email, password_hash, created_at, updated_at)
VALUES ('Client A', '+201001000001', NULL, '$2b$12$fakehash1', NOW(), NOW());

-- 4. Insert second client with SAME phone — should FAIL
DO $$
BEGIN
    INSERT INTO clients (name, phone, email, password_hash, created_at, updated_at)
    VALUES ('Client B', '+201001000001', NULL, '$2b$12$fakehash2', NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate phone should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate phone correctly rejected (unique_violation)';
END;
$$;

-- 5. Insert another client with email = NULL (different phone) — should succeed
INSERT INTO clients (name, phone, email, password_hash, created_at, updated_at)
VALUES ('Client C', '+201001000002', NULL, '$2b$12$fakehash3', NOW(), NOW());

-- 6. Verify two NULL-email rows coexist (partial index allows this)
SELECT COUNT(*) AS null_email_count FROM clients WHERE email IS NULL;
-- Expected: 2

-- 7. Insert client with email = test@example.com — should succeed
INSERT INTO clients (name, phone, email, password_hash, created_at, updated_at)
VALUES ('Client D', '+201001000003', 'test@example.com', '$2b$12$fakehash4', NOW(), NOW());

-- 8. Insert client with same email (different case) — should FAIL
DO $$
BEGIN
    INSERT INTO clients (name, phone, email, password_hash, created_at, updated_at)
    VALUES ('Client E', '+201001000004', 'TEST@example.com', '$2b$12$fakehash5', NOW(), NOW());
    RAISE NOTICE 'FAIL: Duplicate email (case-insensitive) should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate email (case-insensitive) correctly rejected (unique_violation)';
END;
$$;

-- 9. Soft delete: set deleted_at on Client A
UPDATE clients SET deleted_at = NOW() WHERE phone = '+201001000001';

-- 10. Verify soft-deleted record still exists in DB
SELECT name, phone, deleted_at IS NOT NULL AS is_soft_deleted
FROM clients
WHERE phone = '+201001000001';
-- Expected: 1 row, is_soft_deleted = true

-- 11. Verify is_active defaults to TRUE
SELECT name, is_active FROM clients WHERE phone = '+201001000002';
-- Expected: is_active = true

-- 12. Verify column count (no OTP, last_login, verification fields)
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients';
-- Expected: 9

-- 13. Clean up test data
DELETE FROM clients;

-- ============================================================================
-- If all checks pass → Migration 0005 is VERIFIED ✓
-- ============================================================================
