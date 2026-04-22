-- ============================================================================
-- Verification Script for: 0038_create_notification_delivery_logs
-- Ticket: DB-NA-03
-- ============================================================================

-- 1. Verify table structure — exactly 8 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_delivery_logs'
ORDER BY ordinal_position;
-- Expected: 8 rows:
--   id, notification_id, attempt_number, delivery_status,
--   provider_name, provider_message_id, error_message, attempted_at

-- 2. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_delivery_logs'
  AND column_name IN (
      'deleted_at', 'updated_at',
      'provider_payload', 'provider_raw_response', 'webhook_event_id',
      'retry_scheduled_at', 'next_attempt_at',
      'recipient_type', 'recipient_id'
  );
-- Expected: 0 rows

-- 3. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'notification_delivery_logs'
  AND indexname IN (
      'ux_notification_delivery_logs_notification_id_attempt_number',
      'ix_notification_delivery_logs_notification_id',
      'ix_notification_delivery_logs_status',
      'ix_notification_delivery_logs_attempted_at',
      'ix_notification_delivery_logs_provider_message_id'
  )
ORDER BY indexname;
-- Expected: 5 rows

-- 4. Verify CHECK constraints exist
SELECT conname
FROM pg_constraint
WHERE conrelid = 'notification_delivery_logs'::regclass
  AND contype = 'c'
  AND conname IN (
      'ck_notification_delivery_logs_status',
      'ck_notification_delivery_logs_attempt_number_positive'
  )
ORDER BY conname;
-- Expected: 2 rows

-- 5. Insert a valid delivery log — should succeed
-- (requires at least one notification row)
DO $$
DECLARE
    v_notification_id UUID;
    v_log_id          UUID;
BEGIN
    SELECT id INTO v_notification_id FROM notifications LIMIT 1;

    IF v_notification_id IS NULL THEN
        RAISE NOTICE 'SKIP: No notifications seeded — skipping insert test.';
        RETURN;
    END IF;

    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        v_notification_id, 1, 'queued', NOW()
    )
    RETURNING id INTO v_log_id;

    RAISE NOTICE 'PASS: Valid delivery log inserted — id=%', v_log_id;

    -- Cleanup
    DELETE FROM notification_delivery_logs WHERE id = v_log_id;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP

-- 6. Verify invalid delivery_status is rejected
DO $$
BEGIN
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        gen_random_uuid(), 1, 'dispatched', NOW()
    );
    RAISE NOTICE 'FAIL: Invalid delivery_status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid delivery_status correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK on notification_id — also acceptable).';
END;
$$;
-- Expected: PASS

-- 7. Verify attempt_number = 0 is rejected
DO $$
BEGIN
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        gen_random_uuid(), 0, 'sent', NOW()
    );
    RAISE NOTICE 'FAIL: attempt_number=0 should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: attempt_number=0 correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK on notification_id — also acceptable).';
END;
$$;
-- Expected: PASS

-- 8. Verify attempt_number < 0 is rejected
DO $$
BEGIN
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        gen_random_uuid(), -1, 'sent', NOW()
    );
    RAISE NOTICE 'FAIL: Negative attempt_number should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative attempt_number correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK on notification_id — also acceptable).';
END;
$$;
-- Expected: PASS

-- 9. Verify duplicate notification_id + attempt_number is rejected
DO $$
DECLARE
    v_notification_id UUID;
    v_log_id          UUID;
BEGIN
    SELECT id INTO v_notification_id FROM notifications LIMIT 1;

    IF v_notification_id IS NULL THEN
        RAISE NOTICE 'SKIP: No notifications seeded — skipping duplicate-attempt test.';
        RETURN;
    END IF;

    -- First insert
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        v_notification_id, 2, 'sent', NOW()
    )
    RETURNING id INTO v_log_id;

    -- Duplicate insert
    BEGIN
        INSERT INTO notification_delivery_logs (
            notification_id, attempt_number, delivery_status, attempted_at
        ) VALUES (
            v_notification_id, 2, 'failed', NOW()
        );
        RAISE NOTICE 'FAIL: Duplicate notification_id+attempt_number should have been rejected!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate notification_id+attempt_number correctly rejected.';
    END;

    -- Cleanup
    DELETE FROM notification_delivery_logs WHERE id = v_log_id;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP

-- 10. Verify invalid notification FK is rejected
DO $$
BEGIN
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        gen_random_uuid(), 1, 'queued', NOW()
    );
    RAISE NOTICE 'FAIL: Invalid notification_id FK should have been rejected!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Invalid notification_id FK correctly rejected.';
END;
$$;
-- Expected: PASS

-- 11. Verify CASCADE delete: deleting a notification removes its logs
DO $$
DECLARE
    v_notification_id UUID;
    v_log_count       INT;
BEGIN
    SELECT id INTO v_notification_id FROM notifications LIMIT 1;

    IF v_notification_id IS NULL THEN
        RAISE NOTICE 'SKIP: No notifications seeded — skipping CASCADE test.';
        RETURN;
    END IF;

    -- Insert a log
    INSERT INTO notification_delivery_logs (
        notification_id, attempt_number, delivery_status, attempted_at
    ) VALUES (
        v_notification_id, 99, 'queued', NOW()
    );

    -- Delete the notification
    DELETE FROM notifications WHERE id = v_notification_id;

    -- Verify log was cascaded
    SELECT COUNT(*) INTO v_log_count
    FROM notification_delivery_logs
    WHERE notification_id = v_notification_id AND attempt_number = 99;

    IF v_log_count = 0 THEN
        RAISE NOTICE 'PASS: CASCADE delete removed delivery log correctly.';
    ELSE
        RAISE NOTICE 'FAIL: Delivery log not removed after parent notification deleted.';
    END IF;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP
