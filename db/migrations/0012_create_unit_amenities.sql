-- ============================================================================
-- Migration:   0012_create_unit_amenities
-- Ticket:      DB-UA-03
-- Title:       Create unit_amenities join table using a strict many-to-many contract
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units    (units table)
--              0002_create_amenities (amenities table)
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   Create the unit_amenities join table to link units and amenities through
--   a composite-key many-to-many relationship. No surrogate ID — the composite
--   PK (unit_id, amenity_id) is the uniqueness contract, preventing duplicates
--   by design.
--
-- SCHEMA CONTRACT:
--   unit_id       UUID NOT NULL    — FK → units(id) ON DELETE CASCADE
--   amenity_id    UUID NOT NULL    — FK → amenities(id) ON DELETE CASCADE
--   created_at    TIMESTAMP NOT NULL
--
--   PRIMARY KEY (unit_id, amenity_id)  — pk_unit_amenities
--
-- CONVENTIONS APPLIED:
--   ✓ Composite PK — no surrogate id column
--   ✓ snake_case naming
--   ✓ ON DELETE CASCADE on both sides (owned relationship)
--   ✓ created_at audit timestamp only (no updated_at needed for link table)
--   ✓ Correct naming: unit_amenities, NOT guest/unit_guest
--   ✓ Explicit FK/index naming
--   ✓ No soft delete
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE unit_amenities (
    unit_id        UUID        NOT NULL,
    amenity_id     UUID        NOT NULL,
    created_at     TIMESTAMP   NOT NULL,

    -- Composite Primary Key
    CONSTRAINT pk_unit_amenities PRIMARY KEY (unit_id, amenity_id),

    -- Foreign Keys
    CONSTRAINT fk_unit_amenities_unit_id    FOREIGN KEY (unit_id)    REFERENCES units(id)     ON DELETE CASCADE,
    CONSTRAINT fk_unit_amenities_amenity_id FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Index on amenity_id for reverse lookups (find all units with amenity X)
CREATE INDEX ix_unit_amenities_amenity_id ON unit_amenities (amenity_id);
