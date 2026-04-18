DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_notes') THEN
        RAISE EXCEPTION 'Table crm_notes does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, booking_id, crm_lead_id, created_by_admin_user_id, note_text, created_at, updated_at
    FROM crm_notes LIMIT 1;
    
    -- 3. Verify exactly-one-parent check exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_notes_exactly_one_parent') THEN RAISE EXCEPTION 'ck_crm_notes_exactly_one_parent missing'; END IF;

    -- Verify no attachment fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_notes' AND column_name IN ('attachment_url', 'file_name', 'media_id')) THEN
        RAISE EXCEPTION 'Leakage: attachment fields detected in crm_notes table';
    END IF;

    -- Verify no history/edited fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_notes' AND column_name IN ('edited_by', 'edited_at')) THEN
        RAISE EXCEPTION 'Leakage: edit history fields detected in crm_notes table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_notes_booking_id') THEN RAISE EXCEPTION 'fk_crm_notes_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_notes_crm_lead_id') THEN RAISE EXCEPTION 'fk_crm_notes_crm_lead_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_notes_created_by_admin_user_id') THEN RAISE EXCEPTION 'fk_crm_notes_created_by_admin_user_id missing'; END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_notes_booking_id') THEN RAISE EXCEPTION 'ix_crm_notes_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_notes_crm_lead_id') THEN RAISE EXCEPTION 'ix_crm_notes_crm_lead_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_notes_created_by_admin_user_id') THEN RAISE EXCEPTION 'ix_crm_notes_created_by_admin_user_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_notes_created_at') THEN RAISE EXCEPTION 'ix_crm_notes_created_at missing'; END IF;

    RAISE NOTICE 'crm_notes table verified statically successfully.';
END $$;
