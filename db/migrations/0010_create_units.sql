-- ============================================================================
-- Migration:   0010_create_units
-- Ticket:      DB-UA-01
-- Title:       Create units table as the inventory anchor for Units & Availability domain
-- Database:    PostgreSQL 16
-- Depends on:  0006_create_owners (owners table)
--              0003_create_areas  (areas table)
--              0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-16
-- ============================================================================
--
-- PURPOSE:
--   Create the units table as the core inventory entity for Domain 2
--   (Units & Availability). Every subsequent tier in this domain — images,
--   amenities linking, seasonal pricing, date blocks, availability checks,
--   and bookings — depends on this table as its anchor.
--
-- SCHEMA CONTRACT:
--   id                     UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   owner_id               UUID NOT NULL              — FK → owners(id) ON DELETE RESTRICT
--   area_id                UUID NOT NULL              — FK → areas(id) ON DELETE RESTRICT
--   name                   VARCHAR(150) NOT NULL
--   description            TEXT NULL
--   address                VARCHAR(255) NULL
--   unit_type              VARCHAR(50) NOT NULL       — CHECK: apartment, villa, chalet, studio
--   bedrooms               INT NOT NULL               — CHECK: >= 0
--   bathrooms              INT NOT NULL               — CHECK: >= 0
--   max_guests             INT NOT NULL               — CHECK: > 0
--   base_price_per_night   DECIMAL(12,2) NOT NULL     — CHECK: >= 0
--   is_active              BOOLEAN NOT NULL DEFAULT TRUE
--   created_at             TIMESTAMP NOT NULL
--   updated_at             TIMESTAMP NOT NULL
--   deleted_at             TIMESTAMP NULL              — soft delete
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ deleted_at for soft delete
--   ✓ DECIMAL(12,2) for money — never float/double
--   ✓ unit_type as VARCHAR with CHECK — not a DB enum
--   ✓ Availability is derived, NOT stored
--   ✓ Explicit FK/index naming
--   ✓ No DB triggers
--   ✓ No seed data
--
-- EXPLICIT SOURCE-OF-TRUTH RULE:
--   Availability must NOT be stored as a physical column in this table.
--   It will be derived from confirmed bookings + date blocks.
--   Columns such as is_available, availability_status, blocked_until
--   are explicitly forbidden here.
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE units (
    id                     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id               UUID            NOT NULL,
    area_id                UUID            NOT NULL,
    name                   VARCHAR(150)    NOT NULL,
    description            TEXT            NULL,
    address                VARCHAR(255)    NULL,
    unit_type              VARCHAR(50)     NOT NULL,
    bedrooms               INT             NOT NULL,
    bathrooms              INT             NOT NULL,
    max_guests             INT             NOT NULL,
    base_price_per_night   DECIMAL(12,2)   NOT NULL,
    is_active              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP       NOT NULL,
    updated_at             TIMESTAMP       NOT NULL,
    deleted_at             TIMESTAMP       NULL,

    -- Foreign Keys
    CONSTRAINT fk_units_owner_id FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    CONSTRAINT fk_units_area_id  FOREIGN KEY (area_id)  REFERENCES areas(id)  ON DELETE RESTRICT,

    -- Check Constraints
    CONSTRAINT ck_units_unit_type              CHECK (unit_type IN ('apartment', 'villa', 'chalet', 'studio')),
    CONSTRAINT ck_units_bedrooms_non_negative  CHECK (bedrooms >= 0),
    CONSTRAINT ck_units_bathrooms_non_negative CHECK (bathrooms >= 0),
    CONSTRAINT ck_units_max_guests_positive    CHECK (max_guests > 0),
    CONSTRAINT ck_units_base_price_non_negative CHECK (base_price_per_night >= 0)
);

-- Indexes
CREATE INDEX ix_units_owner_id ON units (owner_id);
CREATE INDEX ix_units_area_id  ON units (area_id);
