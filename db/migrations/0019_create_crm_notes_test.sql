DO $$
DECLARE
    v_note_id UUID;
    v_booking_id UUID;
    v_lead_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;
    SELECT id INTO v_lead_id FROM crm_leads LIMIT 1;

    -- insert note with booking only => success
    IF v_booking_id IS NOT NULL THEN
        BEGIN
            INSERT INTO crm_notes (booking_id, crm_lead_id, note_text, created_at, updated_at) 
            VALUES (v_booking_id, NULL, 'Test Note', now(), now())
            RETURNING id INTO v_note_id;
            RAISE NOTICE 'Successfully inserted valid note for booking.';
            DELETE FROM crm_notes WHERE id = v_note_id;
        END;
    END IF;

    -- insert note with lead only => success
    IF v_lead_id IS NOT NULL THEN
        BEGIN
            INSERT INTO crm_notes (booking_id, crm_lead_id, note_text, created_at, updated_at) 
            VALUES (NULL, v_lead_id, 'Test Note', now(), now())
            RETURNING id INTO v_note_id;
            RAISE NOTICE 'Successfully inserted valid note for lead.';
            DELETE FROM crm_notes WHERE id = v_note_id;
        END;
    END IF;

    -- insert note with both null => fail
    BEGIN
        INSERT INTO crm_notes (booking_id, crm_lead_id, note_text, created_at, updated_at) 
        VALUES (NULL, NULL, 'Test Note', now(), now());
        RAISE EXCEPTION 'Failed to reject note with both parents NULL';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught both NULL successfully.';
    END;

    -- insert note with both non-null => fail
    BEGIN
        INSERT INTO crm_notes (booking_id, crm_lead_id, note_text, created_at, updated_at) 
        VALUES (gen_random_uuid(), gen_random_uuid(), 'Test Note', now(), now());
        RAISE EXCEPTION 'Failed to reject note with both parents present';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught both parents present successfully.';
    END;

    -- invalid FK 
    BEGIN
        INSERT INTO crm_notes (booking_id, crm_lead_id, note_text, created_at, updated_at) 
        VALUES (gen_random_uuid(), NULL, 'Test Note', now(), now());
        RAISE EXCEPTION 'Failed to reject invalid FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid FK successfully.';
    END;
END $$;
