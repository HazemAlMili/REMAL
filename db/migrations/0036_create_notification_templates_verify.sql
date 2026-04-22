-- ============================================================================
-- Verification Script for: 0036_create_notification_templates
-- Ticket: DB-NA-01
-- ============================================================================

-- 1. Verify table structure — exactly 9 columns
SELECT column_name, data_type, is_nullable, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_templates'
ORDER BY ordinal_position;
-- Expected: 9 rows:
--   id, template_code, channel, recipient_role, subject_template,
--   body_template, is_active, created_at, updated_at

-- 2. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_templates'
  AND column_name IN (
      'deleted_at',
      'locale', 'language', 'locale_code',
      'version', 'version_number', 'previous_version_id',
      'provider', 'provider_template_id', 'provider_metadata',
      'variables_schema', 'variables', 'campaign_id'
  );
-- Expected: 0 rows

-- 3. Verify indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'notification_templates'
  AND indexname IN (
      'ux_notification_templates_code_channel_role',
      'ix_notification_templates_channel',
      'ix_notification_templates_recipient_role',
      'ix_notification_templates_is_active'
  )
ORDER BY indexname;
-- Expected: 4 rows

-- 4. Verify CHECK constraints exist
SELECT conname
FROM pg_constraint
WHERE conrelid = 'notification_templates'::regclass
  AND contype = 'c'
  AND conname IN (
      'ck_notification_templates_channel',
      'ck_notification_templates_recipient_role',
      'ck_notification_templates_template_code_not_blank',
      'ck_notification_templates_body_template_not_blank'
  )
ORDER BY conname;
-- Expected: 4 rows

-- 5. Insert a valid template (in_app, no subject) — should succeed
INSERT INTO notification_templates (
    template_code, channel, recipient_role,
    subject_template, body_template,
    is_active, created_at, updated_at
) VALUES (
    'booking_confirmed', 'in_app', 'client',
    NULL, 'Your booking {{booking_id}} has been confirmed.',
    TRUE, NOW(), NOW()
);
-- Expected: INSERT 0 1

-- 6. Insert a valid email template (with subject) — should succeed
INSERT INTO notification_templates (
    template_code, channel, recipient_role,
    subject_template, body_template,
    is_active, created_at, updated_at
) VALUES (
    'booking_confirmed', 'email', 'client',
    'Booking Confirmed — {{unit_name}}',
    'Dear {{client_name}}, your booking {{booking_id}} has been confirmed.',
    TRUE, NOW(), NOW()
);
-- Expected: INSERT 0 1

-- 7. Verify invalid channel is rejected
DO $$
BEGIN
    INSERT INTO notification_templates (
        template_code, channel, recipient_role,
        body_template, is_active, created_at, updated_at
    ) VALUES (
        'test_invalid_channel', 'push', 'client',
        'Test body.', TRUE, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid channel should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid channel correctly rejected.';
END;
$$;
-- Expected: PASS

-- 8. Verify invalid recipient_role is rejected
DO $$
BEGIN
    INSERT INTO notification_templates (
        template_code, channel, recipient_role,
        body_template, is_active, created_at, updated_at
    ) VALUES (
        'test_invalid_role', 'email', 'superadmin',
        'Test body.', TRUE, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Invalid recipient_role should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Invalid recipient_role correctly rejected.';
END;
$$;
-- Expected: PASS

-- 9. Verify duplicate template_code + channel + recipient_role is rejected
DO $$
BEGIN
    INSERT INTO notification_templates (
        template_code, channel, recipient_role,
        body_template, is_active, created_at, updated_at
    ) VALUES (
        'booking_confirmed', 'in_app', 'client',
        'Duplicate body.', TRUE, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Duplicate code+channel+role should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate code+channel+role correctly rejected.';
END;
$$;
-- Expected: PASS

-- 10. Verify blank template_code is rejected
DO $$
BEGIN
    INSERT INTO notification_templates (
        template_code, channel, recipient_role,
        body_template, is_active, created_at, updated_at
    ) VALUES (
        '   ', 'sms', 'owner',
        'Test body.', TRUE, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Blank template_code should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Blank template_code correctly rejected.';
END;
$$;
-- Expected: PASS

-- 11. Verify blank body_template is rejected
DO $$
BEGIN
    INSERT INTO notification_templates (
        template_code, channel, recipient_role,
        body_template, is_active, created_at, updated_at
    ) VALUES (
        'blank_body_test', 'whatsapp', 'admin',
        '   ', TRUE, NOW(), NOW()
    );
    RAISE NOTICE 'FAIL: Blank body_template should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Blank body_template correctly rejected.';
END;
$$;
-- Expected: PASS

-- 12. Cleanup test data
DELETE FROM notification_templates
WHERE template_code IN ('booking_confirmed');
-- Expected: DELETE 2 (the two valid inserts from steps 5 and 6)
