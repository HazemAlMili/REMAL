-- ============================================================================
-- Rollback: 0056_add_unit_portfolio_visibility
-- Purpose:  Remove unit public portfolio visibility controls.
-- ============================================================================

BEGIN;

DROP INDEX IF EXISTS ix_units_public_portfolio;

ALTER TABLE units
    DROP COLUMN IF EXISTS is_visible_in_portfolio;

COMMIT;
