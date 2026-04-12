-- ============================================================================
-- Migration:   0003_create_areas
-- Ticket:      DB-MD-03
-- Title:       Create areas table
-- Database:    PostgreSQL 16
-- Depends on:  0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Create the areas master table. Areas are core entities representing
--   geographic/resort zones (e.g., Palm Hills, Abraj Al Alamein).
--   Units belong to areas, and end users browse by area.
--
-- SCHEMA CONTRACT:
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name         VARCHAR(150) NOT NULL  — unique
--   description  TEXT NULL
--   is_active    BOOLEAN NOT NULL DEFAULT TRUE
--   created_at   TIMESTAMP NOT NULL
--   updated_at   TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ No soft delete (not specified for this entity)
--   ✓ No DB triggers
--   ✓ No seed data
--   ✓ No slug, image URL, or analytics columns
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE areas (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150)    NOT NULL,
    description  TEXT            NULL,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP       NOT NULL,
    updated_at   TIMESTAMP       NOT NULL
);

-- Unique index on name to prevent duplicate area entries.
-- Named per convention: ux_{table}_{column}
CREATE UNIQUE INDEX ux_areas_name ON areas (name);
