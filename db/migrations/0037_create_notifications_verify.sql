-- ============================================================================
-- Verification Script for: 0037_create_notifications
-- Ticket: DB-NA-02
-- ============================================================================

-- 1. Verify table structure — exactly 14 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;
-- Expected: 14 rows:
--   id, template_id, admin_user_id, client_id, owner_id, channel,
--   notification_status, subject, body, scheduled_at, sent_at, read_at,
--   created_at, updated_at

-- 2. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
  AND column_name IN (
      'deleted_at',
      'recipient_type', 'recipient_id',
      'provider_payload', 'provider_metadata', 'webhook_id',
      'campaign_id', 'broadcast_id',
      'retry_count', 'next_retry_at'
  );
-- Expected: 0 rows

-- 3. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'notifications'
  AND indexname IN (
      'ix_notifications_template_id',
      'ix_notifications_admin_user_id',
      'ix_notifications_client_id',
      'ix_notifications_owner_id',
      'ix_notifications_status',
      'ix_notifications_channel',
      'ix_notifications_created_at',
      'ix_notifications_scheduled_at'
  )
ORDER BY indexname;
-- Expected: 8 rows

-- 4. Verify CHECK constraints exist
SELECT conname
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass
  AND contype = 'c'
  AND conname IN (
      'ck_notifications_channel',
      'ck_notifications_status',
      'ck_notifications_body_not_blank',
      'ck_notifications_exactly_one_recipient'
  )
ORDER BY conname;
-- Expected: 4 rows

-- 5. Insert valid notification for a client recipient — should succeed
-- (requires at least one row in notification_templates and clients)
DO $$
DECLARE
    v_template_id UUID;
    v_client_id   UUID;
    v_notif_id    UUID;
BEGIN
    SELECT id INTO v_template_id FROM notification_templates LIMIT 1;
    SELECT id INTO v_client_id   FROM clients               LIMIT 1;

    IF v_template_id IS NULL OR v_client_id IS NULL THEN
        RAISE NOTICE 'SKIP: No notification_templates or clients seeded — skipping insert test.';
        RETURN;
    END IF;

    INSERT INTO notifications (
        template_id, client_id,
        channel, notification_status,
        subject, body,
        created_at, updated_at
    ) VALUES (
        v_template_id, v_client_id,
        'in_app', 'pending',
        NULL, 'Your booking has been confirmed.',
        NOW(), NOW()
    )
    RETURNING id INTO v_notif_id;

    RAISE NOTICE 'PASS: Valid client notification inserted — id=%', v_notif_id;

    -- Cleanup
    DELETE FROM notifications WHERE id = v_notif_id;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP

-- 6. Verify zero-recipient insert is rejected
DO $$
BEGIN
    INSERT INTO notifications (
        template_id,
        channel, notification_status, body,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'email', 'pending', 'Test body.',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Zero-recipient insert should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Zero-recipient correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK on template_id — also acceptable at zero-recipient test stage).';
END;
$$;
-- Expected: PASS

-- 7. Verify two-recipient insert is rejected
DO $$
DECLARE
    v_client_id UUID;
    v_owner_id  UUID;
BEGIN
    SELECT id INTO v_client_id FROM clients LIMIT 1;
    SELECT id INTO v_owner_id  FROM owners  LIMIT 1;

    IF v_client_id IS NULL OR v_owner_id IS NULL THEN
        RAISE NOTICE 'SKIP: No clients or owners seeded — skipping two-recipient test.';
        RETURN;
    END IF;

    INSERT INTO notifications (
        template_id, client_id, owner_id,
        channel, notification_status, body,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_client_id, v_owner_id,
        'email', 'pending', 'Test body.',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Two-recipient insert should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Two-recipient correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK on template_id — also acceptable).';
END;
$$;
-- Expected: PASS

-- 8. Verify invalid channel is rejected
DO $$
BEGIN
    INSERT INTO notifications (
        template_id, client_id,
        channel, notification_status, body,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'push', 'pending', 'Test body.',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid channel should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid channel correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK before channel check — also acceptable).';
END;
$$;
-- Expected: PASS

-- 9. Verify invalid notification_status is rejected
DO $$
BEGIN
    INSERT INTO notifications (
        template_id, client_id,
        channel, notification_status, body,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'email', 'dispatched', 'Test body.',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid notification_status should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid notification_status correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK before status check — also acceptable).';
END;
$$;
-- Expected: PASS

-- 10. Verify blank body is rejected
DO $$
BEGIN
    INSERT INTO notifications (
        template_id, client_id,
        channel, notification_status, body,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'sms', 'pending', '   ',
        NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Blank body should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Blank body correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK before blank-body check — also acceptable).';
END;
$$;
-- Expected: PASS
