-- ============================================================================
-- Verification Script for: 0008_seed_dev_master_data
-- Ticket: DB-MD-08
-- ============================================================================

DO $$
DECLARE
    amenity_count INT;
    area_count INT;
    admin_count INT;
BEGIN
    -- 1. Verify Amenities
    SELECT COUNT(*) INTO amenity_count FROM amenities WHERE name IN ('Pool', 'Parking', 'Sea View', 'Gym', 'Kitchen');
    IF amenity_count <> 5 THEN
        RAISE EXCEPTION 'FAIL: Expected 5 seeded amenities, found %', amenity_count;
    END IF;

    -- 2. Verify Areas
    SELECT COUNT(*) INTO area_count FROM areas WHERE name IN ('Palm Hills', 'Abraj Al Alamein', 'Sample Area');
    IF area_count <> 3 THEN
        RAISE EXCEPTION 'FAIL: Expected 3 seeded areas, found %', area_count;
    END IF;

    -- 3. Verify Admin Users
    SELECT COUNT(*) INTO admin_count FROM admin_users WHERE LOWER(email) IN ('superadmin.dev@rental.local', 'sales.dev@rental.local', 'finance.dev@rental.local', 'tech.dev@rental.local');
    IF admin_count <> 4 THEN
        RAISE EXCEPTION 'FAIL: Expected 4 seeded admin_users, found %', admin_count;
    END IF;

    -- 4. Audit Password Hashes (Ensure NO plaintext 'Admin@1234' exists)
    IF EXISTS (SELECT 1 FROM admin_users WHERE password_hash = 'Admin@1234') THEN
        RAISE EXCEPTION 'FAIL: Plaintext password found in database! Security violation.';
    END IF;

    -- Ensure all seeded hashes are strictly BCrypt formats ($2a$ or $2b$)
    IF EXISTS (SELECT 1 FROM admin_users WHERE LOWER(email) LIKE '%.dev@rental.local' AND password_hash NOT LIKE '$2_$%') THEN
        RAISE EXCEPTION 'FAIL: Admin password hash is not a valid BCrypt hash!';
    END IF;

    -- 5. Audit Roles
    IF EXISTS (
        SELECT 1 FROM admin_users 
        WHERE LOWER(email) LIKE '%.dev@rental.local' 
          AND role NOT IN ('super_admin', 'sales', 'finance', 'tech')
    ) THEN
        RAISE EXCEPTION 'FAIL: Invalid role assigned to seeded admin!';
    END IF;

    RAISE NOTICE 'PASS: Seed data successfully verified. All rows present, constraints respected, hashes secured.';
END;
$$;
