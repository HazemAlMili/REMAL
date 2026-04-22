-- ============================================================================
-- Verification Script for: 0034_create_review_replies
-- Ticket: DB-RR-04
-- ============================================================================

-- 1. Verify table structure — exactly 7 columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_replies'
ORDER BY ordinal_position;
-- Expected: 7 rows:
--   id, review_id, owner_id, reply_text, is_visible, created_at, updated_at

-- 2. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_replies'
  AND column_name IN (
      'deleted_at', 'parent_reply_id', 'admin_user_id',
      'edited_at', 'media_url', 'reaction_count'
  );
-- Expected: 0 rows

-- 3. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'review_replies'
  AND indexname IN (
      'ux_review_replies_review_id',
      'ix_review_replies_owner_id',
      'ix_review_replies_is_visible'
  )
ORDER BY indexname;
-- Expected: 3 rows

-- 4. Insert valid reply — should succeed
DO $$
DECLARE v_review_id UUID; v_owner_id UUID;
BEGIN
    SELECT r.id, o.id
    INTO v_review_id, v_owner_id
    FROM reviews r
    JOIN units u ON u.id = r.unit_id
    JOIN owners o ON o.id = u.owner_id
    WHERE r.id NOT IN (SELECT review_id FROM review_replies)
    LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No available review to test insert.';
        RETURN;
    END IF;

    INSERT INTO review_replies (review_id, owner_id, reply_text, is_visible, created_at, updated_at)
    VALUES (v_review_id, v_owner_id, 'Thank you for your feedback!', TRUE, NOW(), NOW());
    RAISE NOTICE 'PASS: Valid reply inserted successfully.';
END;
$$;

-- 5. Verify blank reply_text is rejected
DO $$
DECLARE v_review_id UUID; v_owner_id UUID;
BEGIN
    SELECT r.id, o.id
    INTO v_review_id, v_owner_id
    FROM reviews r
    JOIN units u ON u.id = r.unit_id
    JOIN owners o ON o.id = u.owner_id
    WHERE r.id NOT IN (SELECT review_id FROM review_replies)
    LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No available review to test blank text constraint.';
        RETURN;
    END IF;

    INSERT INTO review_replies (review_id, owner_id, reply_text, is_visible, created_at, updated_at)
    VALUES (v_review_id, v_owner_id, '   ', TRUE, NOW(), NOW());
    RAISE NOTICE 'FAIL: Blank reply_text should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Blank reply_text correctly rejected (check_violation)';
END;
$$;

-- 6. Verify second reply for same review is rejected
DO $$
DECLARE v_review_id UUID; v_owner_id UUID;
BEGIN
    SELECT rr.review_id, rr.owner_id
    INTO v_review_id, v_owner_id
    FROM review_replies rr
    LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No existing reply to test duplicate review_id.';
        RETURN;
    END IF;

    INSERT INTO review_replies (review_id, owner_id, reply_text, is_visible, created_at, updated_at)
    VALUES (v_review_id, v_owner_id, 'Second reply attempt.', TRUE, NOW(), NOW());
    RAISE NOTICE 'FAIL: Second reply for same review should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate review_id correctly rejected (unique_violation)';
END;
$$;

-- 7. Verify cascade delete: deleting a review removes its reply
DO $$
DECLARE
    v_review_id   UUID := gen_random_uuid();
    v_booking_id  UUID;
    v_unit_id     UUID;
    v_client_id   UUID;
    v_owner_id    UUID;
    v_reply_count INT;
BEGIN
    SELECT b.id, b.unit_id, b.client_id, u.owner_id
    INTO v_booking_id, v_unit_id, v_client_id, v_owner_id
    FROM bookings b
    JOIN units u ON u.id = b.unit_id
    WHERE b.id NOT IN (SELECT booking_id FROM reviews)
    LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'SKIP: No available booking to test cascade delete.';
        RETURN;
    END IF;

    INSERT INTO reviews (
        id, booking_id, unit_id, client_id, owner_id,
        rating, review_status, submitted_at, created_at, updated_at
    ) VALUES (
        v_review_id, v_booking_id, v_unit_id, v_client_id, v_owner_id,
        4, 'pending', NOW(), NOW(), NOW()
    );

    INSERT INTO review_replies (review_id, owner_id, reply_text, is_visible, created_at, updated_at)
    VALUES (v_review_id, v_owner_id, 'Reply for cascade test.', TRUE, NOW(), NOW());

    DELETE FROM reviews WHERE id = v_review_id;

    SELECT COUNT(*) INTO v_reply_count
    FROM review_replies WHERE review_id = v_review_id;

    IF v_reply_count = 0 THEN
        RAISE NOTICE 'PASS: Cascade delete correctly removed reply with review.';
    ELSE
        RAISE NOTICE 'FAIL: Reply was NOT removed on review delete!';
    END IF;
END;
$$;

-- 8. Clean up test data
DELETE FROM review_replies WHERE reply_text = 'Thank you for your feedback!';
