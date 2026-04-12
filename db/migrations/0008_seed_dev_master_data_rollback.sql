-- ============================================================================
-- Migration:   0008_seed_dev_master_data (ROLLBACK)
-- Ticket:      DB-MD-08
-- Title:       Rollback — Seed minimal development-only master data
-- Database:    PostgreSQL 16
-- Created:     2026-04-12
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

-- Remove seeded Admin Users
DELETE FROM admin_users 
WHERE LOWER(email) IN (
    'superadmin.dev@rental.local',
    'sales.dev@rental.local',
    'finance.dev@rental.local',
    'tech.dev@rental.local'
);

-- Remove seeded Areas
DELETE FROM areas 
WHERE name IN (
    'Palm Hills',
    'Abraj Al Alamein',
    'Sample Area'
);

-- Remove seeded Amenities
DELETE FROM amenities 
WHERE name IN (
    'Pool',
    'Parking',
    'Sea View',
    'Gym',
    'Kitchen'
);
