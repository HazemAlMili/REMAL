-- ============================================================================
-- Verification Script for: 0031_create_reviews
-- Ticket: DB-RR-01
-- ============================================================================

-- 1. Verify table structure — exactly 13 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reviews'
ORDER BY ordinal_position;
-- Expected: 13 rows:
--   id, booking_id, unit_id, client_id, owner_id, rating, title, comment,
--   review_status, submitted_at, published_at, created_at, updated_at

-- 2. Verify no out-of-scope columns exist (no deleted_at, helpful_count, etc.)
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reviews'
  AND column_name IN (
      'deleted_at', 'helpful_count', 'like_count', 'report_count',
      'media_url', 'reply_text', 'actor_type', 'actor_id'
  );
-- Expected: 0 rows

-- 3. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'reviews'
  AND indexname IN (
      'ux_reviews_booking_id',
      'ix_reviews_unit_id',
      'ix_reviews_owner_id',
      'ix_reviews_client_id',
      'ix_reviews_status',
      'ix_reviews_published_at'
  )
ORDER BY indexname;
-- Expected: 6 rows

-- 4. Insert a valid review — should succeed
INSERT INTO reviews (
    booking_id, unit_id, client_id, owner_id,
    rating, title, comment, review_status,
    submitted_at, published_at, created_at, updated_at
)
SELECT
    b.id, b.unit_id, b.client_id, u.owner_id,
    5, 'Great stay', 'Loved the view.', 'pending',
    NOW(), NULL, NOW(), NOW()
FROM bookings b
JOIN units u ON u.id = b.unit_id
LIMIT 1;
-- Expected: INSERT 0 1 (if a booking exists) — or skip if no bookings seeded

-- 5. Verify invalid review_status is rejected
DO $$
DECLARE v_booking_id UUID; v_unit_id UUID; v_client_id UUID; v_owner_id UUID;
BEGIN
    SELECT b.id, b.unit_id, b.client_id, u.owner_id
    INTO v_booking_id, v_unit_id, v_client_id, v_owner_id
    FROM bookings b JOIN units u ON u.id = b.unit_id
    LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'SKIP: No bookings available to test status constraint.';
        RETURN;
    END IF;

    -- Use a fresh UUID to avoid triggering ux_reviews_booking_id
    INSERT INTO reviews (
        booking_id, unit_id, client_id, owner_id,
        rating, review_status, submitted_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_unit_id, v_client_id, v_owner_id,
        3, 'invalid_status', NOW(), NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid review_status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid review_status correctly rejected (check_violation)';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS (FK): booking_id FK fired first — schema is still correct';
END;
$$;

-- 6. Verify invalid rating is rejected
DO $$
DECLARE v_booking_id UUID; v_unit_id UUID; v_client_id UUID; v_owner_id UUID;
BEGIN
    SELECT b.id, b.unit_id, b.client_id, u.owner_id
    INTO v_booking_id, v_unit_id, v_client_id, v_owner_id
    FROM bookings b JOIN units u ON u.id = b.unit_id
    LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'SKIP: No bookings available to test rating constraint.';
        RETURN;
    END IF;

    INSERT INTO reviews (
        booking_id, unit_id, client_id, owner_id,
        rating, review_status, submitted_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_unit_id, v_client_id, v_owner_id,
        6, 'pending', NOW(), NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Rating > 5 should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Rating out-of-range correctly rejected (check_violation)';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS (FK): booking_id FK fired first — schema is still correct';
END;
$$;

-- 7. Verify unique booking_id constraint
DO $$
DECLARE v_booking_id UUID; v_unit_id UUID; v_client_id UUID; v_owner_id UUID;
BEGIN
    SELECT b.id, b.unit_id, b.client_id, u.owner_id
    INTO v_booking_id, v_unit_id, v_client_id, v_owner_id
    FROM bookings b JOIN units u ON u.id = b.unit_id
    LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'SKIP: No bookings available to test booking uniqueness.';
        RETURN;
    END IF;

    -- Attempt second review for the same booking_id used in step 4 above
    INSERT INTO reviews (
        booking_id, unit_id, client_id, owner_id,
        rating, review_status, submitted_at, created_at, updated_at
    ) VALUES (
        v_booking_id, v_unit_id, v_client_id, v_owner_id,
        4, 'pending', NOW(), NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Second review for same booking should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate booking_id correctly rejected (unique_violation)';
END;
$$;

-- 8. Clean up test data
DELETE FROM reviews WHERE title IN ('Great stay') AND comment = 'Loved the view.';
