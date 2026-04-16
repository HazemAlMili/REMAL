-- ============================================================================
-- Migration:   0014_create_date_blocks
-- Ticket:      DB-UA-05
-- Title:       Create date_blocks table as an explicit non-booking availability blocker source
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units (units table)
--              0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   Create the date_blocks table to represent admin-controlled blocked dates
--   for units, independent from bookings. This is the second source for
--   availability computation (alongside confirmed bookings, which come later).
--   Reasons include maintenance, owner personal use, or manual blocks.
--
-- SCHEMA CONTRACT:
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   unit_id      UUID NOT NULL               — FK → units(id) ON DELETE CASCADE
--   start_date   DATE NOT NULL
--   end_date     DATE NOT NULL               — CHECK: start_date <= end_date
--   reason       VARCHAR(100) NULL
--   notes        TEXT NULL
--   created_at   TIMESTAMP NOT NULL
--   updated_at   TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ ON DELETE CASCADE — date blocks are owned by the unit
--   ✓ No soft delete (not required for this entity)
--   ✓ No booking linkage (operational blocks only)
--   ✓ No stored availability fields
--   ✓ Overlap resolution deferred to Business tier
--   ✓ Explicit FK/index naming
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE date_blocks (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id      UUID           NOT NULL,
    start_date   DATE           NOT NULL,
    end_date     DATE           NOT NULL,
    reason       VARCHAR(100)   NULL,
    notes        TEXT           NULL,
    created_at   TIMESTAMP      NOT NULL,
    updated_at   TIMESTAMP      NOT NULL,

    -- Foreign Key
    CONSTRAINT fk_date_blocks_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,

    -- Check Constraints
    CONSTRAINT ck_date_blocks_valid_date_range CHECK (start_date <= end_date)
);

-- Indexes
CREATE INDEX ix_date_blocks_unit_id            ON date_blocks (unit_id);
CREATE INDEX ix_date_blocks_unit_id_date_range ON date_blocks (unit_id, start_date, end_date);
