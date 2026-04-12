-- ============================================================================
-- Migration:   0008_seed_dev_master_data
-- Ticket:      DB-MD-08
-- Title:       Seed minimal development-only master data
-- Database:    PostgreSQL 16
-- Depends on:  0002 (amenities), 0003 (areas), 0004 (admin_users)
-- Created:     2026-04-12
-- ============================================================================
--
-- PURPOSE:
--   Seed basic master data (admin users, amenities, areas) to make the local 
--   development DB immediately usable.
--
-- DESIGN DECISIONS:
--   - Uses idempotent INSERT ... ON CONFLICT DO NOTHING to ensure safety on
--     repeated migrations.
--   - Admin password stored exclusively as BCrypt hash (Cost: 12) per contract.
--     (Password: Admin@1234)
--   - Limited to essential master data; NO production data, clients, owners,
--     or transactional data (units, bookings) seeded.
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

-- 1. Seed Amenities
-- Conflict target matches the ux_amenities_name index.
INSERT INTO amenities (name, created_at, updated_at)
VALUES 
    ('Pool', NOW(), NOW()),
    ('Parking', NOW(), NOW()),
    ('Sea View', NOW(), NOW()),
    ('Gym', NOW(), NOW()),
    ('Kitchen', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;


-- 2. Seed Areas
-- Conflict target matches the ux_areas_name index.
INSERT INTO areas (name, description, is_active, created_at, updated_at)
VALUES 
    ('Palm Hills', 'Palm Hills development zone', true, NOW(), NOW()),
    ('Abraj Al Alamein', 'New Alamein coastal towers', true, NOW(), NOW()),
    ('Sample Area', 'Local testing sample area', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;


-- 3. Seed Admin Users
-- All use the pre-calculated BCrypt cost 12 hash for 'Admin@1234':
-- $2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6
-- Conflict target matches the functional index: ux_admin_users_email on LOWER(email)
INSERT INTO admin_users (name, email, password_hash, role, is_active, created_at, updated_at)
VALUES 
    ('Dev Super Admin', 'superadmin.dev@rental.local', '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6', 'super_admin', true, NOW(), NOW()),
    ('Dev Sales',       'sales.dev@rental.local',       '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6', 'sales',       true, NOW(), NOW()),
    ('Dev Finance',     'finance.dev@rental.local',     '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6', 'finance',     true, NOW(), NOW()),
    ('Dev Tech',        'tech.dev@rental.local',        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6', 'tech',        true, NOW(), NOW())
ON CONFLICT (LOWER(email)) DO NOTHING;
