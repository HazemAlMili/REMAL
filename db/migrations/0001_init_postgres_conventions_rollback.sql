-- ============================================================================
-- Migration:   0001_init_postgres_conventions (ROLLBACK)
-- Ticket:      DB-MD-01
-- Title:       Rollback — Initialize PostgreSQL base conventions
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================
--
-- DOWN MIGRATION — Safe Rollback Behavior
--
-- Policy Decision:
--   The pgcrypto extension is dropped on rollback because:
--   - This is migration #0001 (no prior migrations depend on it)
--   - Rolling back this migration means reverting to a completely clean DB
--   - No business tables exist at this point that use gen_random_uuid()
--
-- WARNING:
--   If future migrations have been applied on top of this one,
--   rolling back to this point will fail unless those migrations
--   are rolled back first (standard migration chain behavior).
--
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

-- Drop the pgcrypto extension.
-- Safe at this point because no tables or columns reference gen_random_uuid().
-- IF EXISTS ensures idempotency.
DROP EXTENSION IF EXISTS pgcrypto;
