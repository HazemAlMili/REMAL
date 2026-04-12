-- ============================================================================
-- Migration:   0007_master_data_integrity_cleanup
-- Ticket:      DB-MD-07
-- Title:       Master data integrity cleanup and naming normalization
-- Database:    PostgreSQL 16
-- Depends on:  0002 to 0006 master data migrations
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Normalize constraint/index naming across all master data tables.
--   Our initial schema contracts were fully respected regarding columns, 
--   types, defaults, and the explicitly named unique/check constraints 
--   (ux_* and ck_*).
--
--   However, PostgreSQL auto-generates primary key constraint names
--   using the "{table}_pkey" pattern (e.g., amenities_pkey).
--   To ensure 100% naming normalization without drift before the data 
--   access tier is started, we normalize these to "pk_{table}".
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

ALTER TABLE amenities RENAME CONSTRAINT amenities_pkey TO pk_amenities;
ALTER TABLE areas RENAME CONSTRAINT areas_pkey TO pk_areas;
ALTER TABLE admin_users RENAME CONSTRAINT admin_users_pkey TO pk_admin_users;
ALTER TABLE clients RENAME CONSTRAINT clients_pkey TO pk_clients;
ALTER TABLE owners RENAME CONSTRAINT owners_pkey TO pk_owners;
