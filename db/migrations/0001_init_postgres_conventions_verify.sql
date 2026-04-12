-- ============================================================================
-- Verification Script for: 0001_init_postgres_conventions
-- Ticket: DB-MD-01
-- ============================================================================
-- Run this AFTER applying the migration to verify all acceptance criteria.
-- Expected: All queries succeed with no errors.
-- ============================================================================

-- 1. Verify pgcrypto extension is available
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pgcrypto';
-- Expected: 1 row returned with extname = 'pgcrypto'

-- 2. Verify gen_random_uuid() works
SELECT gen_random_uuid() AS test_uuid;
-- Expected: Returns a valid UUID v4 (e.g., 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')

-- 3. Verify NO business tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
-- Expected: 0 rows (empty result — no tables exist)

-- 4. Verify NO triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Expected: 0 rows (no triggers)

-- 5. Verify NO custom PostgreSQL enum types were created
SELECT typname
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e';
-- Expected: 0 rows (no enums)

-- 6. Verify uuid-ossp is NOT installed
SELECT extname
FROM pg_extension
WHERE extname = 'uuid-ossp';
-- Expected: 0 rows (uuid-ossp must NOT be present)

-- ============================================================================
-- If all checks pass → Migration 0001 is VERIFIED ✓
-- ============================================================================
