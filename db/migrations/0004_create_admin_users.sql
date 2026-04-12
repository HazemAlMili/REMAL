-- ============================================================================
-- Migration:   0004_create_admin_users
-- Ticket:      DB-MD-04
-- Title:       Create admin_users table
-- Database:    PostgreSQL 16
-- Depends on:  0001_init_postgres_conventions (pgcrypto)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Create the admin_users table for platform administrators.
--   Each admin has a role (super_admin, sales, finance, tech) enforced
--   at the DB level via CHECK constraint. Email uniqueness is
--   case-insensitive via a functional unique index on LOWER(email).
--
-- DESIGN DECISIONS:
--   - No deleted_at: admin deactivation is handled via is_active only.
--     Historical admin records must remain queryable in MVP.
--   - Role is stored as VARCHAR (frozen convention), not a PG enum type.
--   - password_hash stores BCrypt output — never plaintext.
--
-- SCHEMA CONTRACT:
--   id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name           VARCHAR(150) NOT NULL
--   email          VARCHAR(255) NOT NULL  — unique (case-insensitive)
--   password_hash  VARCHAR(255) NOT NULL
--   role           VARCHAR(50) NOT NULL   — CHECK: super_admin|sales|finance|tech
--   is_active      BOOLEAN NOT NULL DEFAULT TRUE
--   created_at     TIMESTAMP NOT NULL
--   updated_at     TIMESTAMP NOT NULL
--
-- CONVENTIONS APPLIED:
--   ✓ UUID PK via gen_random_uuid() (pgcrypto)
--   ✓ snake_case naming
--   ✓ created_at + updated_at (NOT NULL, managed by EF Core)
--   ✓ Enums stored as VARCHAR with CHECK constraint
--   ✓ No soft delete (intentional — deactivation via is_active)
--   ✓ No DB triggers
--   ✓ No seed data
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE admin_users (
    id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150)    NOT NULL,
    email          VARCHAR(255)    NOT NULL,
    password_hash  VARCHAR(255)    NOT NULL,
    role           VARCHAR(50)     NOT NULL,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL,
    updated_at     TIMESTAMP       NOT NULL,

    -- Check constraint: role must be one of the 4 allowed values
    CONSTRAINT ck_admin_users_role CHECK (role IN ('super_admin', 'sales', 'finance', 'tech'))
);

-- Case-insensitive unique index on email.
-- Prevents duplicates like ADMIN@example.com vs admin@example.com.
CREATE UNIQUE INDEX ux_admin_users_email ON admin_users (LOWER(email));
