-- ============================================================================
-- Migration:   0006_create_owners
-- Ticket:      DB-MD-06
-- Title:       Create owners table
-- Database:    PostgreSQL 16
-- Depends on:  0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Create the owners table. Owners represent property owners and manage
--   their properties within the system. Support commission rate, status,
--   and soft deletions.
--
-- SCHEMA CONTRACT:
--   id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name             VARCHAR(150) NOT NULL
--   phone            VARCHAR(30) NOT NULL           — unique
--   email            VARCHAR(255) NULL              — unique when not null (case-insensitive)
--   commission_rate  DECIMAL(5,2) NOT NULL          — CHECK: >= 0 and <= 100
--   notes            TEXT NULL
--   status           VARCHAR(50) NOT NULL           — CHECK: active | inactive
--   created_at       TIMESTAMP NOT NULL
--   updated_at       TIMESTAMP NOT NULL
--   deleted_at       TIMESTAMP NULL                 — soft delete
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ deleted_at for soft delete
--   ✓ status and commission constraints
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE owners (
    id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(150)    NOT NULL,
    phone            VARCHAR(30)     NOT NULL,
    email            VARCHAR(255)    NULL,
    commission_rate  DECIMAL(5,2)    NOT NULL,
    notes            TEXT            NULL,
    status           VARCHAR(50)     NOT NULL,
    created_at       TIMESTAMP       NOT NULL,
    updated_at       TIMESTAMP       NOT NULL,
    deleted_at       TIMESTAMP       NULL,

    -- Constraints
    CONSTRAINT ck_owners_commission_rate CHECK (commission_rate >= 0.00 AND commission_rate <= 100.00),
    CONSTRAINT ck_owners_status CHECK (status IN ('active', 'inactive'))
);

-- Unique index on phone
CREATE UNIQUE INDEX ux_owners_phone ON owners (phone);

-- Partial unique index on LOWER(email)
CREATE UNIQUE INDEX ux_owners_email_not_null ON owners (LOWER(email)) WHERE email IS NOT NULL;
