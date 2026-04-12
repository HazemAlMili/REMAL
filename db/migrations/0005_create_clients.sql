-- ============================================================================
-- Migration:   0005_create_clients
-- Ticket:      DB-MD-05
-- Title:       Create clients table
-- Database:    PostgreSQL 16
-- Depends on:  0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Create the clients table for end users who browse, book, and review.
--   Clients register via the booking flow (name + phone + password).
--   Email is optional. Soft delete is supported for preserving booking history.
--
-- DESIGN DECISIONS:
--   - phone is required and unique (primary contact method)
--   - email is nullable but unique when present (partial unique index)
--   - deleted_at enables soft delete while keeping booking/review history
--   - is_active allows deactivation without soft-deleting
--   - No OTP, email verification, refresh tokens, or last_login fields
--
-- SCHEMA CONTRACT:
--   id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name           VARCHAR(150) NOT NULL
--   phone          VARCHAR(30) NOT NULL   — unique
--   email          VARCHAR(255) NULL      — unique when not null (case-insensitive)
--   password_hash  VARCHAR(255) NOT NULL
--   is_active      BOOLEAN NOT NULL DEFAULT TRUE
--   created_at     TIMESTAMP NOT NULL
--   updated_at     TIMESTAMP NOT NULL
--   deleted_at     TIMESTAMP NULL         — soft delete
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ deleted_at for soft delete (as specified for this entity)
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE clients (
    id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150)    NOT NULL,
    phone          VARCHAR(30)     NOT NULL,
    email          VARCHAR(255)    NULL,
    password_hash  VARCHAR(255)    NOT NULL,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL,
    updated_at     TIMESTAMP       NOT NULL,
    deleted_at     TIMESTAMP       NULL
);

-- Unique index on phone — primary contact, must be unique
CREATE UNIQUE INDEX ux_clients_phone ON clients (phone);

-- Partial unique index on LOWER(email) — only enforced when email is NOT NULL.
-- Allows multiple rows with email = NULL without violating uniqueness.
CREATE UNIQUE INDEX ux_clients_email_not_null ON clients (LOWER(email)) WHERE email IS NOT NULL;
