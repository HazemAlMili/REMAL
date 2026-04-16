-- ============================================================================
-- Migration:   0013_create_seasonal_pricing (ROLLBACK)
-- Ticket:      DB-UA-04
-- Title:       Rollback — Create seasonal_pricing table
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_seasonal_pricing_unit_id_date_range;
DROP INDEX IF EXISTS ix_seasonal_pricing_unit_id;

DROP TABLE IF EXISTS seasonal_pricing;
