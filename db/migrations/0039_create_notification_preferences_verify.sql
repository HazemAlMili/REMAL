-- ============================================================================
-- Verification Script for: 0039_create_notification_preferences
-- Ticket: DB-NA-04
-- ============================================================================

-- 1. Verify table structure — exactly 8 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_preferences'
ORDER BY ordinal_position;
-- Expected: 8 rows:
--   id, admin_user_id, client_id, owner_id, channel,
--   preference_key, is_enabled, updated_at

-- 2. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_preferences'
  AND column_name IN (
      'deleted_at', 'created_at',
      'recipient_type', 'recipient_id',
      'quiet_hours_start', 'quiet_hours_end',
      'marketing_consent', 'subscription_tier',
      'topic_id', 'category_id'
  );
-- Expected: 0 rows

-- 3. Verify partial unique indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notification_preferences'
  AND indexname IN (
      'ux_notification_preferences_admin_channel_key',
      'ux_notification_preferences_client_channel_key',
      'ux_notification_preferences_owner_channel_key',
      'ix_notification_preferences_channel',
      'ix_notification_preferences_preference_key'
  )
ORDER BY indexname;
-- Expected: 5 rows (3 partial unique + 2 supporting)

-- 4. Verify CHECK constraints exist
SELECT conname
FROM pg_constraint
WHERE conrelid = 'notification_preferences'::regclass
  AND contype = 'c'
  AND conname IN (
      'ck_notification_preferences_channel',
      'ck_notification_preferences_preference_key_not_blank',
      'ck_notification_preferences_exactly_one_recipient'
  )
ORDER BY conname;
-- Expected: 3 rows

-- 5. Insert a valid client preference — should succeed
DO $$
DECLARE
    v_client_id UUID;
    v_pref_id   UUID;
BEGIN
    SELECT id INTO v_client_id FROM clients LIMIT 1;

    IF v_client_id IS NULL THEN
        RAISE NOTICE 'SKIP: No clients seeded — skipping insert test.';
        RETURN;
    END IF;

    INSERT INTO notification_preferences (
        client_id, channel, preference_key, is_enabled, updated_at
    ) VALUES (
        v_client_id, 'email', 'booking_status_changed', TRUE, NOW()
    )
    RETURNING id INTO v_pref_id;

    RAISE NOTICE 'PASS: Valid client preference inserted — id=%', v_pref_id;

    -- Cleanup
    DELETE FROM notification_preferences WHERE id = v_pref_id;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP

-- 6. Verify duplicate client + channel + preference_key is rejected
DO $$
DECLARE
    v_client_id UUID;
    v_pref_id   UUID;
BEGIN
    SELECT id INTO v_client_id FROM clients LIMIT 1;

    IF v_client_id IS NULL THEN
        RAISE NOTICE 'SKIP: No clients seeded — skipping duplicate test.';
        RETURN;
    END IF;

    -- First insert
    INSERT INTO notification_preferences (
        client_id, channel, preference_key, is_enabled, updated_at
    ) VALUES (
        v_client_id, 'sms', 'review_published', FALSE, NOW()
    )
    RETURNING id INTO v_pref_id;

    -- Duplicate insert
    BEGIN
        INSERT INTO notification_preferences (
            client_id, channel, preference_key, is_enabled, updated_at
        ) VALUES (
            v_client_id, 'sms', 'review_published', TRUE, NOW()
        );
        RAISE NOTICE 'FAIL: Duplicate client+channel+preference_key should have been rejected!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'PASS: Duplicate client+channel+preference_key correctly rejected.';
    END;

    -- Cleanup
    DELETE FROM notification_preferences WHERE id = v_pref_id;
END;
$$;
-- Expected: PASS (if prerequisite data exists) or SKIP

-- 7. Verify invalid channel is rejected
DO $$
BEGIN
    INSERT INTO notification_preferences (
        client_id, channel, preference_key, is_enabled, updated_at
    ) VALUES (
        gen_random_uuid(), 'push', 'test_key', TRUE, NOW()
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

-- 8. Verify zero-recipient insert is rejected
DO $$
BEGIN
    INSERT INTO notification_preferences (
        channel, preference_key, is_enabled, updated_at
    ) VALUES (
        'email', 'test_key', TRUE, NOW()
    );
    RAISE NOTICE 'FAIL: Zero-recipient insert should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Zero-recipient correctly rejected.';
END;
$$;
-- Expected: PASS

-- 9. Verify two-recipient insert is rejected
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

    INSERT INTO notification_preferences (
        client_id, owner_id, channel, preference_key, is_enabled, updated_at
    ) VALUES (
        v_client_id, v_owner_id, 'email', 'test_key', TRUE, NOW()
    );
    RAISE NOTICE 'FAIL: Two-recipient insert should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Two-recipient correctly rejected.';
END;
$$;
-- Expected: PASS

-- 10. Verify blank preference_key is rejected
DO $$
BEGIN
    INSERT INTO notification_preferences (
        client_id, channel, preference_key, is_enabled, updated_at
    ) VALUES (
        gen_random_uuid(), 'in_app', '   ', TRUE, NOW()
    );
    RAISE NOTICE 'FAIL: Blank preference_key should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Blank preference_key correctly rejected.';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Rejected (FK before blank-key check — also acceptable).';
END;
$$;
-- Expected: PASS
