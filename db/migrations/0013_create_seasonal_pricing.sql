-- ============================================================================
-- Migration:   0013_create_seasonal_pricing
-- Ticket:      DB-UA-04
-- Title:       Create seasonal_pricing table for time-bounded nightly price overrides
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units (units table)
--              0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   Create the seasonal_pricing table to support per-unit nightly price
--   overrides over bounded date ranges. Each row represents a date window
--   where the unit's base_price_per_night is overridden by a seasonal rate.
--
-- SCHEMA CONTRACT:
--   id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   unit_id          UUID NOT NULL               — FK → units(id) ON DELETE CASCADE
--   start_date       DATE NOT NULL
--   end_date         DATE NOT NULL               — CHECK: start_date <= end_date
--   price_per_night  DECIMAL(12,2) NOT NULL      — CHECK: >= 0
--   created_at       TIMESTAMP NOT NULL
--   updated_at       TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ DECIMAL(12,2) for money — never float/double
--   ✓ ON DELETE CASCADE — seasonal pricing is owned by the unit
--   ✓ No soft delete (not required for this entity)
--   ✓ No overlap/exclusion constraint (deferred to Business tier)
--   ✓ No derived totals (total_price, tax, discount, etc.)
--   ✓ Explicit FK/index naming
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE seasonal_pricing (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id          UUID           NOT NULL,
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    price_per_night  DECIMAL(12,2)  NOT NULL,
    created_at       TIMESTAMP      NOT NULL,
    updated_at       TIMESTAMP      NOT NULL,

    -- Foreign Key
    CONSTRAINT fk_seasonal_pricing_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,

    -- Check Constraints
    CONSTRAINT ck_seasonal_pricing_valid_date_range  CHECK (start_date <= end_date),
    CONSTRAINT ck_seasonal_pricing_price_non_negative CHECK (price_per_night >= 0)
);

-- Indexes
CREATE INDEX ix_seasonal_pricing_unit_id            ON seasonal_pricing (unit_id);
CREATE INDEX ix_seasonal_pricing_unit_id_date_range ON seasonal_pricing (unit_id, start_date, end_date);
