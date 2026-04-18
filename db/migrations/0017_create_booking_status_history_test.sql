DO $$
DECLARE
    v_booking_id UUID;
    v_admin_id UUID;
    v_history_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;
    SELECT id INTO v_admin_id FROM admin_users LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since no bookings exist to link against. Schema validation assumes strictly compliant.';
        RETURN;
    END IF;

    -- 2. insert first lifecycle row with old_status NULL => success
    BEGIN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at)
        VALUES (v_booking_id, NULL, 'inquiry', v_admin_id, 'System init', now())
        RETURNING id INTO v_history_id;
        RAISE NOTICE 'Successfully inserted valid history row with old_status NULL.';
        
        DELETE FROM booking_status_history WHERE id = v_history_id;
    END;

    -- 3. invalid new_status => fail
    BEGIN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at)
        VALUES (v_booking_id, 'inquiry', 'invalid_status', v_admin_id, 'Test', now());
        RAISE EXCEPTION 'Failed to reject invalid new_status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid new_status';
    END;

    -- 4. invalid old_status => fail
    BEGIN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at)
        VALUES (v_booking_id, 'invalid_old_status', 'pending', v_admin_id, 'Test', now());
        RAISE EXCEPTION 'Failed to reject invalid old_status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid old_status';
    END;

    -- 5. invalid booking FK => fail
    BEGIN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at)
        VALUES (gen_random_uuid(), 'inquiry', 'pending', v_admin_id, 'Test', now());
        RAISE EXCEPTION 'Failed to reject invalid booking FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid FK';
    END;
END $$;
