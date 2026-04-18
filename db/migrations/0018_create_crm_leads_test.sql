DO $$
DECLARE
    v_lead_id UUID;
    v_client_id UUID;
    v_unit_id UUID;
BEGIN
    SELECT id INTO v_client_id FROM clients LIMIT 1;
    SELECT id INTO v_unit_id FROM units LIMIT 1;

    -- valid insert test
    BEGIN
        INSERT INTO crm_leads (
            client_id, target_unit_id, contact_name, contact_phone, 
            lead_status, source, created_at, updated_at
        ) 
        VALUES (
            v_client_id, v_unit_id, 'John Doe', '01000000000', 
            'new', 'website', now(), now()
        ) RETURNING id INTO v_lead_id;
        RAISE NOTICE 'Successfully inserted valid lead.';
        DELETE FROM crm_leads WHERE id = v_lead_id;
    END;

    -- invalid desired stay range null check handles one null gracefully
    BEGIN
        INSERT INTO crm_leads (
            contact_name, contact_phone, lead_status, source, 
            desired_check_in_date, desired_check_out_date,
            created_at, updated_at
        ) 
        VALUES (
            'John Doe', '01000000000', 'new', 'website', 
            '2026-06-05', NULL,
            now(), now()
        ) RETURNING id INTO v_lead_id;
        RAISE NOTICE 'Successfully allowed one null date.';
        DELETE FROM crm_leads WHERE id = v_lead_id;
    END;

    -- invalid desired stay range (end <= start)
    BEGIN
        INSERT INTO crm_leads (
            contact_name, contact_phone, lead_status, source, 
            desired_check_in_date, desired_check_out_date,
            created_at, updated_at
        ) 
        VALUES (
            'John Doe', '01000000000', 'new', 'website', 
            '2026-06-05', '2026-06-03',
            now(), now()
        );
        RAISE EXCEPTION 'Failed to reject invalid stay range';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid desired stay range successfully.';
    END;

    -- invalid lead_status
    BEGIN
        INSERT INTO crm_leads (
            contact_name, contact_phone, lead_status, source, 
            created_at, updated_at
        ) 
        VALUES (
            'John Doe', '01000000000', 'invalid_status', 'website', 
            now(), now()
        );
        RAISE EXCEPTION 'Failed to reject invalid lead status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid lead status successfully.';
    END;

    -- invalid source
    BEGIN
        INSERT INTO crm_leads (
            contact_name, contact_phone, lead_status, source, 
            created_at, updated_at
        ) 
        VALUES (
            'John Doe', '01000000000', 'new', 'invalid_source', 
            now(), now()
        );
        RAISE EXCEPTION 'Failed to reject invalid source';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid source successfully.';
    END;

    -- guest_count = 0 
    BEGIN
        INSERT INTO crm_leads (
            contact_name, contact_phone, lead_status, source, guest_count,
            created_at, updated_at
        ) 
        VALUES (
            'John Doe', '01000000000', 'new', 'website', 0,
            now(), now()
        );
        RAISE EXCEPTION 'Failed to reject invalid guest count (0)';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid guest count successfully.';
    END;

    -- invalid FK 
    BEGIN
        INSERT INTO crm_leads (
            client_id, contact_name, contact_phone, lead_status, source, 
            created_at, updated_at
        ) 
        VALUES (
            gen_random_uuid(), 'John Doe', '01000000000', 'new', 'website', 
            now(), now()
        );
        RAISE EXCEPTION 'Failed to reject invalid FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid FK successfully.';
    END;
END $$;
