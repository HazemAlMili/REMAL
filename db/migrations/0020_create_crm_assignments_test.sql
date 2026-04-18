DO $$
DECLARE
    v_assignment_id UUID;
    v_booking_id UUID;
    v_lead_id UUID;
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;
    SELECT id INTO v_lead_id FROM crm_leads LIMIT 1;
    SELECT id INTO v_admin_id FROM admin_users LIMIT 1;

    -- insert with booking only
    IF v_booking_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        BEGIN
            INSERT INTO crm_assignments (booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at) 
            VALUES (v_booking_id, NULL, v_admin_id, true, now(), now())
            RETURNING id INTO v_assignment_id;
            RAISE NOTICE 'Successfully inserted valid assignment for booking.';
            DELETE FROM crm_assignments WHERE id = v_assignment_id;
        END;
    END IF;

    -- insert with lead only
    IF v_lead_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        BEGIN
            INSERT INTO crm_assignments (booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at) 
            VALUES (NULL, v_lead_id, v_admin_id, true, now(), now())
            RETURNING id INTO v_assignment_id;
            RAISE NOTICE 'Successfully inserted valid assignment for lead.';
            DELETE FROM crm_assignments WHERE id = v_assignment_id;
        END;
    END IF;

    -- both null parent
    BEGIN
        INSERT INTO crm_assignments (booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at) 
        VALUES (NULL, NULL, v_admin_id, true, now(), now());
        RAISE EXCEPTION 'Failed to reject both parents null';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught both parents null successfully.';
    END;

    -- both non-null parent
    BEGIN
        INSERT INTO crm_assignments (booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at) 
        VALUES (gen_random_uuid(), gen_random_uuid(), v_admin_id, true, now(), now());
        RAISE EXCEPTION 'Failed to reject both parents present';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught both parents present successfully.';
    END;

    -- null assigned_admin_user_id
    BEGIN
        INSERT INTO crm_assignments (booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at) 
        VALUES (v_booking_id, NULL, NULL, true, now(), now());
        RAISE EXCEPTION 'Failed to reject null admin user';
    EXCEPTION WHEN not_null_violation THEN
        RAISE NOTICE 'Caught null admin user successfully.';
    END;
END $$;
