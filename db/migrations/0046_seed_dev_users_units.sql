-- ============================================================================
-- Migration:   0046_seed_dev_users_units
-- Title:       Seed dev owners, clients, areas, amenities, and units
-- Database:    PostgreSQL 16
-- Depends on:  0009 (owners.password_hash), 0010 (units), 0008 (areas)
-- Created:     2026-05-04
-- ============================================================================
--
-- DEV CREDENTIALS (all use BCrypt cost-12 hash of 'Admin@1234'):
--
--   ADMIN (email login):
--     superadmin.dev@rental.local   / Admin@1234   (role: super_admin)
--     sales.dev@rental.local        / Admin@1234   (role: sales)
--     finance.dev@rental.local      / Admin@1234   (role: finance)
--     tech.dev@rental.local         / Admin@1234   (role: tech)
--
--   OWNER (phone login):
--     +201001234567                 / Admin@1234   (Ahmed Hassan)
--     +201009876543                 / Admin@1234   (Mohamed Ali)
--
--   CLIENT / GUEST (phone login):
--     +201111111111                 / Admin@1234   (Sara El-Sayed)
--     +201222222222                 / Admin@1234   (Khaled Ibrahim)
--
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────
-- 1. Extra Areas (Egypt coastal & resort destinations)
-- ────────────────────────────────────────────────
INSERT INTO areas (name, description, is_active, created_at, updated_at)
VALUES
    ('Marassi', 'Premium beach resort on the North Coast of Egypt', true, NOW(), NOW()),
    ('Sahel North Coast', 'Egypt''s most popular summer destination on the Mediterranean', true, NOW(), NOW()),
    ('Gouna', 'Red Sea resort city with canals and lagoons near Hurghada', true, NOW(), NOW()),
    ('Sharm El Sheikh', 'World-class diving and beach resort on the Red Sea', true, NOW(), NOW()),
    ('Ain Sokhna', 'Closest Red Sea resort to Cairo', true, NOW(), NOW()),
    ('New Cairo', 'Modern residential area east of Cairo', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────
-- 2. Extra Amenities
-- ────────────────────────────────────────────────
INSERT INTO amenities (name, created_at, updated_at)
VALUES
    ('WiFi', NOW(), NOW()),
    ('Air Conditioning', NOW(), NOW()),
    ('Private Beach', NOW(), NOW()),
    ('BBQ', NOW(), NOW()),
    ('Smart TV', NOW(), NOW()),
    ('Washer/Dryer', NOW(), NOW()),
    ('Garden', NOW(), NOW()),
    ('Security System', NOW(), NOW()),
    ('Children Play Area', NOW(), NOW()),
    ('Concierge', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────
-- 3. Dev Owners  (BCrypt cost-12 hash of 'Admin@1234')
--    Hash: $2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6
-- ────────────────────────────────────────────────
INSERT INTO owners (id, name, phone, email, commission_rate, notes, status, password_hash, created_at, updated_at)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Ahmed Hassan',
        '+201001234567',
        'ahmed.owner@remal.dev',
        10.00,
        'Primary dev/test owner account. Has multiple units across North Coast and Red Sea.',
        'active',
        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6',
        NOW(), NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Mohamed Ali',
        '+201009876543',
        'mohamed.owner@remal.dev',
        15.00,
        'Secondary dev/test owner account. Premium villa owner.',
        'active',
        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6',
        NOW(), NOW()
    )
ON CONFLICT (phone) DO NOTHING;

-- ────────────────────────────────────────────────
-- 4. Dev Clients / Guests  (BCrypt cost-12 hash of 'Admin@1234')
-- ────────────────────────────────────────────────
INSERT INTO clients (id, name, phone, email, password_hash, is_active, created_at, updated_at)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Sara El-Sayed',
        '+201111111111',
        'sara.guest@remal.dev',
        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6',
        true,
        NOW(), NOW()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Khaled Ibrahim',
        '+201222222222',
        'khaled.guest@remal.dev',
        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6',
        true,
        NOW(), NOW()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Nour Mahmoud',
        '+201333333333',
        'nour.guest@remal.dev',
        '$2a$12$4.qulKpTtx0cQYeHmv.sgeGpeYM0/86IFEfgfhWuwuQT1JC.aFZQ6',
        true,
        NOW(), NOW()
    )
ON CONFLICT (phone) DO NOTHING;

-- ────────────────────────────────────────────────
-- 5. Units  (linked to owners + existing areas)
-- ────────────────────────────────────────────────
-- Resolve area IDs by name so we're not hardcoding potentially stale UUIDs
DO $$
DECLARE
    v_palm_hills      UUID := (SELECT id FROM areas WHERE name = 'Palm Hills' LIMIT 1);
    v_alamein         UUID := (SELECT id FROM areas WHERE name = 'Abraj Al Alamein' LIMIT 1);
    v_marassi         UUID := (SELECT id FROM areas WHERE name = 'Marassi' LIMIT 1);
    v_sahel           UUID := (SELECT id FROM areas WHERE name = 'Sahel North Coast' LIMIT 1);
    v_gouna           UUID := (SELECT id FROM areas WHERE name = 'Gouna' LIMIT 1);
    v_sokhna          UUID := (SELECT id FROM areas WHERE name = 'Ain Sokhna' LIMIT 1);
    v_owner1          UUID := '11111111-1111-1111-1111-111111111111';
    v_owner2          UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    INSERT INTO units (id, owner_id, area_id, name, description, address, unit_type, bedrooms, bathrooms, max_guests, base_price_per_night, is_active, created_at, updated_at)
    VALUES
        -- Ahmed Hassan's units
        (
            '00000000-0000-0000-0000-000000000001',
            v_owner1, v_alamein,
            'Luxury 2BR Apartment - Abraj Al Alamein Tower A',
            'Stunning sea-view apartment on the 18th floor of Abraj Al Alamein. Fully furnished with premium finishes, open kitchen, and a large balcony overlooking the Mediterranean.',
            'Tower A, Floor 18, Abraj Al Alamein, New Alamein City',
            'apartment', 2, 2, 5,
            1800.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000002',
            v_owner1, v_palm_hills,
            'Modern Studio - Palm Hills Compound',
            'Cozy studio apartment in the heart of Palm Hills. Ideal for couples. Features a kitchenette, en-suite bathroom, and access to community pool and gym.',
            'Building 12, Apt 3B, Palm Hills, 6th of October',
            'studio', 0, 1, 2,
            650.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000003',
            v_owner1, v_marassi,
            'Beachfront 3BR Chalet - Marassi Village',
            'Spacious beachfront chalet just 50 meters from the private Marassi beach. Features 3 bedrooms, a fully equipped kitchen, and a private terrace with sea views.',
            'Marassi Village, Phase 3, Sidi Abdel Rahman, North Coast',
            'chalet', 3, 2, 7,
            2400.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000004',
            v_owner1, v_sahel,
            '4BR Villa - Hacienda Bay',
            'Luxurious private villa in Hacienda Bay with private pool, lush garden, and direct lagoon access. Perfect for large families seeking a premium summer escape.',
            'Hacienda Bay, Plot 88, Sidi Heneish, North Coast',
            'villa', 4, 3, 9,
            5500.00, true, NOW(), NOW()
        ),
        -- Mohamed Ali's units
        (
            '00000000-0000-0000-0000-000000000005',
            v_owner2, v_gouna,
            'Charming 1BR Apartment - El Gouna Marina',
            'Lovely apartment overlooking El Gouna marina. Steps away from restaurants, cafes, and the beach. Air-conditioned, WiFi, fully furnished.',
            'Marina View Building, El Gouna, Hurghada',
            'apartment', 1, 1, 3,
            950.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000006',
            v_owner2, v_sokhna,
            'Modern 2BR Apartment - Porto Sokhna',
            'Contemporary apartment in Porto Sokhna resort. Includes pool access, beach club entry, and a fully equipped kitchen. Only 1.5 hours from Cairo.',
            'Porto Sokhna, Building C, Ain Sokhna Road',
            'apartment', 2, 1, 4,
            1100.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000007',
            v_owner2, v_gouna,
            'Luxury 3BR Villa - El Gouna',
            'Stunning standalone villa with private pool in El Gouna upscale residential zone. Fully staffed (housekeeper and driver available). Ideal for an exclusive Red Sea retreat.',
            'West Golf, El Gouna, Hurghada',
            'villa', 3, 3, 8,
            4200.00, true, NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000008',
            v_owner2, v_alamein,
            'Sea-View Studio - Abraj Al Alamein Tower C',
            'Compact and well-appointed studio with panoramic sea views from the 22nd floor. Perfect for solo travelers or couples visiting New Alamein.',
            'Tower C, Floor 22, Abraj Al Alamein, New Alamein City',
            'studio', 0, 1, 2,
            780.00, true, NOW(), NOW()
        )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- ────────────────────────────────────────────────
-- 6. Unit ↔ Amenity links
-- ────────────────────────────────────────────────
DO $$
DECLARE
    -- Amenity IDs resolved by name
    v_pool       UUID := (SELECT id FROM amenities WHERE name = 'Pool' LIMIT 1);
    v_parking    UUID := (SELECT id FROM amenities WHERE name = 'Parking' LIMIT 1);
    v_sea_view   UUID := (SELECT id FROM amenities WHERE name = 'Sea View' LIMIT 1);
    v_gym        UUID := (SELECT id FROM amenities WHERE name = 'Gym' LIMIT 1);
    v_kitchen    UUID := (SELECT id FROM amenities WHERE name = 'Kitchen' LIMIT 1);
    v_wifi       UUID := (SELECT id FROM amenities WHERE name = 'WiFi' LIMIT 1);
    v_ac         UUID := (SELECT id FROM amenities WHERE name = 'Air Conditioning' LIMIT 1);
    v_beach      UUID := (SELECT id FROM amenities WHERE name = 'Private Beach' LIMIT 1);
    v_bbq        UUID := (SELECT id FROM amenities WHERE name = 'BBQ' LIMIT 1);
    v_tv         UUID := (SELECT id FROM amenities WHERE name = 'Smart TV' LIMIT 1);
BEGIN
    INSERT INTO unit_amenities (unit_id, amenity_id, created_at)
    VALUES
        -- u1: Alamein apartment
        ('00000000-0000-0000-0000-000000000001', v_sea_view, NOW()),
        ('00000000-0000-0000-0000-000000000001', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000001', v_ac,       NOW()),
        ('00000000-0000-0000-0000-000000000001', v_kitchen,  NOW()),
        ('00000000-0000-0000-0000-000000000001', v_parking,  NOW()),
        -- u2: Palm Hills studio
        ('00000000-0000-0000-0000-000000000002', v_pool,     NOW()),
        ('00000000-0000-0000-0000-000000000002', v_gym,      NOW()),
        ('00000000-0000-0000-0000-000000000002', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000002', v_ac,       NOW()),
        -- u3: Marassi chalet
        ('00000000-0000-0000-0000-000000000003', v_sea_view, NOW()),
        ('00000000-0000-0000-0000-000000000003', v_beach,    NOW()),
        ('00000000-0000-0000-0000-000000000003', v_bbq,      NOW()),
        ('00000000-0000-0000-0000-000000000003', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000003', v_kitchen,  NOW()),
        -- u4: Hacienda villa
        ('00000000-0000-0000-0000-000000000004', v_pool,     NOW()),
        ('00000000-0000-0000-0000-000000000004', v_sea_view, NOW()),
        ('00000000-0000-0000-0000-000000000004', v_beach,    NOW()),
        ('00000000-0000-0000-0000-000000000004', v_bbq,      NOW()),
        ('00000000-0000-0000-0000-000000000004', v_parking,  NOW()),
        ('00000000-0000-0000-0000-000000000004', v_tv,       NOW()),
        -- u5: Gouna apartment
        ('00000000-0000-0000-0000-000000000005', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000005', v_ac,       NOW()),
        ('00000000-0000-0000-0000-000000000005', v_kitchen,  NOW()),
        ('00000000-0000-0000-0000-000000000005', v_tv,       NOW()),
        -- u6: Sokhna apartment
        ('00000000-0000-0000-0000-000000000006', v_pool,     NOW()),
        ('00000000-0000-0000-0000-000000000006', v_beach,    NOW()),
        ('00000000-0000-0000-0000-000000000006', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000006', v_kitchen,  NOW()),
        -- u7: Gouna villa
        ('00000000-0000-0000-0000-000000000007', v_pool,     NOW()),
        ('00000000-0000-0000-0000-000000000007', v_sea_view, NOW()),
        ('00000000-0000-0000-0000-000000000007', v_gym,      NOW()),
        ('00000000-0000-0000-0000-000000000007', v_bbq,      NOW()),
        ('00000000-0000-0000-0000-000000000007', v_parking,  NOW()),
        -- u8: Alamein studio
        ('00000000-0000-0000-0000-000000000008', v_sea_view, NOW()),
        ('00000000-0000-0000-0000-000000000008', v_wifi,     NOW()),
        ('00000000-0000-0000-0000-000000000008', v_ac,       NOW())
    ON CONFLICT DO NOTHING;
END $$;

COMMIT;
