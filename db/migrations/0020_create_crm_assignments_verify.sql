DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_assignments') THEN
        RAISE EXCEPTION 'Table crm_assignments does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, booking_id, crm_lead_id, assigned_admin_user_id, is_active, assigned_at, updated_at
    FROM crm_assignments LIMIT 1;

    -- Verify assigned_admin_user_id is not nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_assignments' AND column_name = 'assigned_admin_user_id' AND is_nullable = 'YES') THEN
        RAISE EXCEPTION 'assigned_admin_user_id must NOT be nullable';
    END IF;

    -- 3. Verify specifically no workflow overreach fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_assignments' AND column_name IN ('queue_id', 'priority', 'sla_deadline', 'ended_at', 'escalation_level')) THEN
        RAISE EXCEPTION 'Leakage of queue/escalation/SLA fields detected in crm_assignments table';
    END IF;

    -- 4. Verify exactly-one-parent check exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_assignments_exactly_one_parent') THEN RAISE EXCEPTION 'ck_crm_assignments_exactly_one_parent missing'; END IF;

    -- 5. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_assignments_booking_id') THEN RAISE EXCEPTION 'fk_crm_assignments_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_assignments_crm_lead_id') THEN RAISE EXCEPTION 'fk_crm_assignments_crm_lead_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_crm_assignments_assigned_admin_user_id') THEN RAISE EXCEPTION 'fk_crm_assignments_assigned_admin_user_id missing'; END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_assignments_booking_id') THEN RAISE EXCEPTION 'ix_crm_assignments_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_assignments_crm_lead_id') THEN RAISE EXCEPTION 'ix_crm_assignments_crm_lead_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_assignments_assigned_admin_user_id') THEN RAISE EXCEPTION 'ix_crm_assignments_assigned_admin_user_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_crm_assignments_is_active') THEN RAISE EXCEPTION 'ix_crm_assignments_is_active missing'; END IF;

    RAISE NOTICE 'crm_assignments table verified statically successfully.';
END $$;
