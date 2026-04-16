-- ============================================================================
-- Migration:   0015_units_availability_integrity_cleanup
-- Ticket:      DB-UA-06
-- Title:       Run Units & Availability schema integrity cleanup
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units to 0014_create_date_blocks
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   This migration acts as a domain completion check and schema integrity pass.
--   Since the previous migrations (DB-UA-01 to DB-UA-05) closely adhered to
--   strict schema contracts, no structural cleanup operations (like renaming
--   columns, dropping speculative fields, or fixing constraints) are required.
--   This file serves as a checkpoint to signal that the Units & Availability
--   database tier is frozen and ready for the Data Access layer.
--
-- ============================================================================

-- =====================
-- UP MIGRATION
-- =====================

-- Add table comments to solidify the domain boundaries
COMMENT ON TABLE units IS 'Core inventory anchor for Units & Availability domain. No computed availability state here.';
COMMENT ON TABLE unit_images IS 'Ordered media references for units. No public URLs, localized alt text, or file size metadata.';
COMMENT ON TABLE unit_amenities IS 'Strict composite-key many-to-many join table connecting units and amenities. No surrogate id.';
COMMENT ON TABLE seasonal_pricing IS 'Per-unit nightly price overrides over bounded date ranges. No derived totals or booking references.';
COMMENT ON TABLE date_blocks IS 'Source of operational non-booking unavailability (e.g. maintenance). No overlap exclusion checks here.';

-- Ensure table statistics are up-to-date
ANALYZE units;
ANALYZE unit_images;
ANALYZE unit_amenities;
ANALYZE seasonal_pricing;
ANALYZE date_blocks;
