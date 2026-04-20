-- ============================================
-- REMAL Platform — Combined DB Init Script
-- Runs all migrations in order on first start
-- ============================================

\echo '=== Running migration 0001: init postgres conventions ==='
\i /docker-entrypoint-initdb.d/migrations/0001_init_postgres_conventions.sql

\echo '=== Running migration 0002: create amenities ==='
\i /docker-entrypoint-initdb.d/migrations/0002_create_amenities.sql

\echo '=== Running migration 0003: create areas ==='
\i /docker-entrypoint-initdb.d/migrations/0003_create_areas.sql

\echo '=== Running migration 0004: create admin users ==='
\i /docker-entrypoint-initdb.d/migrations/0004_create_admin_users.sql

\echo '=== Running migration 0005: create clients ==='
\i /docker-entrypoint-initdb.d/migrations/0005_create_clients.sql

\echo '=== Running migration 0006: create owners ==='
\i /docker-entrypoint-initdb.d/migrations/0006_create_owners.sql

\echo '=== Running migration 0007: master data integrity cleanup ==='
\i /docker-entrypoint-initdb.d/migrations/0007_master_data_integrity_cleanup.sql

\echo '=== Running migration 0008: seed dev master data ==='
\i /docker-entrypoint-initdb.d/migrations/0008_seed_dev_master_data.sql

\echo '=== Running migration 0009: add owner password hash ==='
\i /docker-entrypoint-initdb.d/migrations/0009_add_owner_password_hash_to_owners.sql

\echo '=== Running migration 0010: create units ==='
\i /docker-entrypoint-initdb.d/migrations/0010_create_units.sql

\echo '=== Running migration 0011: create unit_images ==='
\i /docker-entrypoint-initdb.d/migrations/0011_create_unit_images.sql

\echo '=== Running migration 0012: create unit_amenities ==='
\i /docker-entrypoint-initdb.d/migrations/0012_create_unit_amenities.sql

\echo '=== Running migration 0013: create seasonal_pricing ==='
\i /docker-entrypoint-initdb.d/migrations/0013_create_seasonal_pricing.sql

\echo '=== Running migration 0014: create date_blocks ==='
\i /docker-entrypoint-initdb.d/migrations/0014_create_date_blocks.sql

\echo '=== Running migration 0015: units availability integrity cleanup ==='
\i /docker-entrypoint-initdb.d/migrations/0015_units_availability_integrity_cleanup.sql


\echo '=== Running migration 0016: create bookings ==='
\i /docker-entrypoint-initdb.d/migrations/0016_create_bookings.sql

\echo '=== Running migration 0017: create booking status history ==='
\i /docker-entrypoint-initdb.d/migrations/0017_create_booking_status_history.sql

\echo '=== Running migration 0018: create crm leads ==='
\i /docker-entrypoint-initdb.d/migrations/0018_create_crm_leads.sql

\echo '=== Running migration 0019: create crm notes ==='
\i /docker-entrypoint-initdb.d/migrations/0019_create_crm_notes.sql

\echo '=== Running migration 0020: create crm assignments ==='
\i /docker-entrypoint-initdb.d/migrations/0020_create_crm_assignments.sql

\echo '=== Running migration 0021: booking crm integrity cleanup ==='
\i /docker-entrypoint-initdb.d/migrations/0021_booking_crm_integrity_cleanup.sql

\echo '=== All migrations completed successfully ==='

