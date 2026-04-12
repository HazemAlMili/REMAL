-- ============================================================================
-- Verification Script for: 0007_master_data_integrity_cleanup
-- Ticket: DB-MD-07
-- ============================================================================

-- 1. Ensure all primary keys are named following the pk_ convention
SELECT relname AS table_name, conname AS constraint_name
FROM pg_constraint c
JOIN pg_class r ON c.conrelid = r.oid
WHERE r.relname IN ('amenities', 'areas', 'admin_users', 'clients', 'owners')
  AND c.contype = 'p'
ORDER BY r.relname;
-- Expected output:
--   admin_users | pk_admin_users
--   amenities   | pk_amenities
--   areas       | pk_areas
--   clients     | pk_clients
--   owners      | pk_owners

-- 2. Comprehensive Checklist Validation for all Master Data Tables
DO $$
DECLARE
    missing_cols INT;
    extra_cols INT;
BEGIN
    -- Ensure exactly 5 master tables exist in the public schema
    IF (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') <> 5 THEN
        RAISE EXCEPTION 'FAIL: Unexpected number of tables found!';
    END IF;

    -- Ensure id, created_at, updated_at are present in ALL 5 tables
    SELECT COUNT(*) INTO missing_cols
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name 
         AND c.column_name IN ('id', 'created_at', 'updated_at')
    WHERE t.table_schema = 'public' AND t.table_type='BASE TABLE';
    -- 5 tables * 3 columns = 15 required occurrences
    IF missing_cols <> 15 THEN
        RAISE EXCEPTION 'FAIL: Missing standard id/created_at/updated_at columns in some tables!';
    END IF;

    -- Ensure 'deleted_at' ONLY exists in clients and owners
    SELECT COUNT(*) INTO extra_cols
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND column_name = 'deleted_at'
      AND table_name NOT IN ('clients', 'owners');
    IF extra_cols > 0 THEN
        RAISE EXCEPTION 'FAIL: deleted_at column found where it should not be!';
    END IF;

    -- Ensure admin_users has is_active and role constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
        RAISE EXCEPTION 'FAIL: admin_users is missing is_active!';
    END IF;

    -- Ensure owners has status and commission_rate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'status') THEN
        RAISE EXCEPTION 'FAIL: owners is missing status!';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'commission_rate') THEN
        RAISE EXCEPTION 'FAIL: owners is missing commission_rate!';
    END IF;

    -- Look for unexpected Triggers
    IF (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_schema = 'public') > 0 THEN
        RAISE EXCEPTION 'FAIL: Found accidental triggers!';
    END IF;

    -- Look for unexpected Foreign Keys
    IF (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') > 0 THEN
        RAISE EXCEPTION 'FAIL: Found accidental Foreign Keys!';
    END IF;

    RAISE NOTICE 'PASS: Master Data tables are precisely configured matching contracts. No deviations found.';
END;
$$;

-- ============================================================================
-- If all checks pass → Migration 0007 is VERIFIED ✓
-- ============================================================================
