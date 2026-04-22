-- ============================================================================
-- Verification Script for: 0032_create_review_status_history
-- Ticket: DB-RR-02
-- ============================================================================

-- 1. Verify table structure — exactly 7 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_status_history'
ORDER BY ordinal_position;
-- Expected: 7 rows:
--   id, review_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at

-- 2. Verify old_status is nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_status_history'
  AND column_name = 'old_status';
-- Expected: is_nullable = YES

-- 3. Verify new_status is NOT nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_status_history'
  AND column_name = 'new_status';
-- Expected: is_nullable = NO

-- 4. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'review_status_history'
  AND column_name IN (
      'deleted_at', 'actor_type', 'actor_id',
      'notification_sent', 'queue_id', 'report_id'
  );
-- Expected: 0 rows

-- 5. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'review_status_history'
  AND indexname IN (
      'ix_review_status_history_review_id',
      'ix_review_status_history_changed_at',
      'ix_review_status_history_changed_by_admin_user_id'
  )
ORDER BY indexname;
-- Expected: 3 rows

-- 6. Insert initial history row with old_status = NULL — should succeed
DO $$
DECLARE v_review_id UUID;
BEGIN
    SELECT id INTO v_review_id FROM reviews LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No reviews available. Insert a review first to test history.';
        RETURN;
    END IF;

    INSERT INTO review_status_history (
        review_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at
    ) VALUES (
        v_review_id, NULL, 'pending', NULL, 'Initial submission', NOW()
    );
    RAISE NOTICE 'PASS: Initial history row with NULL old_status inserted successfully.';
END;
$$;

-- 7. Verify invalid new_status is rejected
DO $$
DECLARE v_review_id UUID;
BEGIN
    SELECT id INTO v_review_id FROM reviews LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No reviews available to test new_status constraint.';
        RETURN;
    END IF;

    INSERT INTO review_status_history (
        review_id, old_status, new_status, changed_at
    ) VALUES (
        v_review_id, 'pending', 'invalid_status', NOW()
    );
    RAISE NOTICE 'FAIL: Invalid new_status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid new_status correctly rejected (check_violation)';
END;
$$;

-- 8. Verify invalid old_status is rejected (when not null)
DO $$
DECLARE v_review_id UUID;
BEGIN
    SELECT id INTO v_review_id FROM reviews LIMIT 1;

    IF v_review_id IS NULL THEN
        RAISE NOTICE 'SKIP: No reviews available to test old_status constraint.';
        RETURN;
    END IF;

    INSERT INTO review_status_history (
        review_id, old_status, new_status, changed_at
    ) VALUES (
        v_review_id, 'invalid_old', 'published', NOW()
    );
    RAISE NOTICE 'FAIL: Invalid old_status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid old_status correctly rejected (check_violation)';
END;
$$;

-- 9. Verify cascade delete: deleting a review removes its history rows
DO $$
DECLARE
    v_review_id UUID := gen_random_uuid();
    v_booking_id UUID;
    v_unit_id UUID;
    v_client_id UUID;
    v_owner_id UUID;
    v_history_count INT;
BEGIN
    SELECT b.id, b.unit_id, b.client_id, u.owner_id
    INTO v_booking_id, v_unit_id, v_client_id, v_owner_id
    FROM bookings b JOIN units u ON u.id = b.unit_id
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
        3, 'pending', NOW(), NOW(), NOW()
    );

    INSERT INTO review_status_history (review_id, old_status, new_status, changed_at)
    VALUES (v_review_id, NULL, 'pending', NOW());

    DELETE FROM reviews WHERE id = v_review_id;

    SELECT COUNT(*) INTO v_history_count
    FROM review_status_history
    WHERE review_id = v_review_id;

    IF v_history_count = 0 THEN
        RAISE NOTICE 'PASS: Cascade delete correctly removed history rows with review.';
    ELSE
        RAISE NOTICE 'FAIL: History rows were NOT removed on review delete!';
    END IF;
END;
$$;

-- 10. Clean up test history data
DELETE FROM review_status_history WHERE notes = 'Initial submission';
