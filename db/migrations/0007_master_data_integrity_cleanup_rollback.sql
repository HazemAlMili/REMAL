-- ============================================================================
-- Migration:   0007_master_data_integrity_cleanup (ROLLBACK)
-- Ticket:      DB-MD-07
-- Title:       Rollback — Master data integrity cleanup
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

ALTER TABLE amenities RENAME CONSTRAINT pk_amenities TO amenities_pkey;
ALTER TABLE areas RENAME CONSTRAINT pk_areas TO areas_pkey;
ALTER TABLE admin_users RENAME CONSTRAINT pk_admin_users TO admin_users_pkey;
ALTER TABLE clients RENAME CONSTRAINT pk_clients TO clients_pkey;
ALTER TABLE owners RENAME CONSTRAINT pk_owners TO owners_pkey;
