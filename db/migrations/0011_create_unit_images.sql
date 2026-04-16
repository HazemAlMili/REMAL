-- ============================================================================
-- Migration:   0011_create_unit_images
-- Ticket:      DB-UA-02
-- Title:       Create unit_images table for ordered media linked to units
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units (units table)
--              0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   Create the unit_images table to store ordered media references for units.
--   Each image is identified by a storage key (not a public URL), supports
--   display ordering, and a cover-image flag for catalog display.
--
-- SCHEMA CONTRACT:
--   id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   unit_id         UUID NOT NULL               — FK → units(id) ON DELETE CASCADE
--   file_key        VARCHAR(500) NOT NULL        — storage reference, not a URL
--   is_cover        BOOLEAN NOT NULL DEFAULT FALSE
--   display_order   INT NOT NULL DEFAULT 0       — CHECK: >= 0
--   created_at      TIMESTAMP NOT NULL
--   updated_at      TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ No soft delete (not required for this entity)
--   ✓ file_key is storage reference only — no public_url, thumbnail_url,
--     mime_type, or file_size columns
--   ✓ ON DELETE CASCADE — images are owned by the unit
--   ✓ Explicit FK/index naming
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE unit_images (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id         UUID        NOT NULL,
    file_key        VARCHAR(500) NOT NULL,
    is_cover        BOOLEAN     NOT NULL DEFAULT FALSE,
    display_order   INT         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP   NOT NULL,
    updated_at      TIMESTAMP   NOT NULL,

    -- Foreign Key
    CONSTRAINT fk_unit_images_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,

    -- Check Constraints
    CONSTRAINT ck_unit_images_display_order_non_negative CHECK (display_order >= 0)
);

-- Indexes
CREATE INDEX ix_unit_images_unit_id                ON unit_images (unit_id);
CREATE INDEX ix_unit_images_unit_id_display_order   ON unit_images (unit_id, display_order);
