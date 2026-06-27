-- ============================================================================
-- Migration: 0056_add_unit_portfolio_visibility
-- Purpose:   Decouple public storefront visibility from operational unit status.
-- Depends:   0055_date_block_approvals
-- ============================================================================

BEGIN;

ALTER TABLE units
    ADD COLUMN is_visible_in_portfolio BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN units.is_visible_in_portfolio IS
    'Controls whether an active unit appears in the public storefront portfolio/catalog. '
    'Operational eligibility remains governed by is_active.';

CREATE INDEX ix_units_public_portfolio
    ON units (is_active, is_visible_in_portfolio, created_at DESC)
    WHERE deleted_at IS NULL;

COMMIT;
