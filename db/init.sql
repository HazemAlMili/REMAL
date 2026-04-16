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

\echo '=== All migrations completed successfully ==='
