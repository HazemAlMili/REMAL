-- ============================================================================
-- Migration:   0002_create_amenities
-- Ticket:      DB-MD-02
-- Title:       Create amenities table
-- Database:    PostgreSQL 16
-- Depends on:  0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Create the amenities master lookup table. This is a standalone reference
--   table with no foreign keys. It will be used later by unit_amenities
--   (join table) to tag units with amenities like Pool, Sea View, Parking, etc.
--
-- SCHEMA CONTRACT:
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name        VARCHAR(100) NOT NULL  — unique
--   icon        VARCHAR(255) NULL
--   created_at  TIMESTAMP NOT NULL
--   updated_at  TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ No soft delete (not specified for this entity)
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE amenities (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)    NOT NULL,
    icon        VARCHAR(255)    NULL,
    created_at  TIMESTAMP       NOT NULL,
    updated_at  TIMESTAMP       NOT NULL
);

-- Unique index on name to prevent duplicate amenity entries.
-- Named per convention: ux_{table}_{column}
CREATE UNIQUE INDEX ux_amenities_name ON amenities (name);
