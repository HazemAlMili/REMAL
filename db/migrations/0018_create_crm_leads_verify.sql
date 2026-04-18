DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_leads') THEN
        RAISE EXCEPTION 'Table crm_leads does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, client_id, target_unit_id, assigned_admin_user_id, contact_name, contact_phone, contact_email, desired_check_in_date, desired_check_out_date, guest_count, lead_status, source, notes, created_at, updated_at
    FROM crm_leads LIMIT 1;
    
    -- 3. Verify no booking_id exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name = 'booking_id') THEN
        RAISE EXCEPTION 'Leakage: booking_id field detected in crm_leads table';
    END IF;

    -- Verify no deleted_at exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name = 'deleted_at') THEN
        RAISE EXCEPTION 'Leakage: deleted_at field detected in crm_leads table';
    END IF;

    -- Verify no lead scoring fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name IN ('score', 'priority_score', 'campaign_id')) THEN
        RAISE EXCEPTION 'Leakage: scoring or campaign fields detected in crm_leads table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_leads_client_id') THEN RAISE EXCEPTION 'fk_crm_leads_client_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_leads_target_unit_id') THEN RAISE EXCEPTION 'fk_crm_leads_target_unit_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_leads_assigned_admin_user_id') THEN RAISE EXCEPTION 'fk_crm_leads_assigned_admin_user_id missing'; END IF;

    -- 5. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_status') THEN RAISE EXCEPTION 'ck_crm_leads_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_source') THEN RAISE EXCEPTION 'ck_crm_leads_source missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_valid_desired_stay_range') THEN RAISE EXCEPTION 'ck_crm_leads_valid_desired_stay_range missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_guest_count_positive') THEN RAISE EXCEPTION 'ck_crm_leads_guest_count_positive missing'; END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_client_id') THEN RAISE EXCEPTION 'ix_crm_leads_client_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_target_unit_id') THEN RAISE EXCEPTION 'ix_crm_leads_target_unit_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_assigned_admin_user_id') THEN RAISE EXCEPTION 'ix_crm_leads_assigned_admin_user_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_status') THEN RAISE EXCEPTION 'ix_crm_leads_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_source') THEN RAISE EXCEPTION 'ix_crm_leads_source missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_leads_contact_phone') THEN RAISE EXCEPTION 'ix_crm_leads_contact_phone missing'; END IF;

    RAISE NOTICE 'crm_leads table verified statically successfully.';
END $$;
