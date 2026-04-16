-- ============================================================================
-- Migration:   0015_units_availability_integrity_cleanup (ROLLBACK)
-- Ticket:      DB-UA-06
-- Title:       Rollback — Run Units & Availability schema integrity cleanup
-- Database:    PostgreSQL 16
-- Created:     2026-04-16
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

COMMENT ON TABLE units IS NULL;
COMMENT ON TABLE unit_images IS NULL;
COMMENT ON TABLE unit_amenities IS NULL;
COMMENT ON TABLE seasonal_pricing IS NULL;
COMMENT ON TABLE date_blocks IS NULL;
