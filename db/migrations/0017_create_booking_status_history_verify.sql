DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_status_history') THEN
        RAISE EXCEPTION 'Table booking_status_history does not exist';
    END IF;

    -- 2. Verify Columns & exact nullability rules
    PERFORM id, booking_id, old_status, new_status, changed_by_admin_user_id, notes, changed_at
    FROM booking_status_history LIMIT 1;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_status_history' AND column_name = 'old_status' AND is_nullable = 'YES') THEN
        RAISE EXCEPTION 'old_status must be nullable';
    END IF;

    -- 3. Verify no generic actor polymorphism fields exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_status_history' AND column_name IN ('actor_type', 'actor_id')) THEN
        RAISE EXCEPTION 'Leakage of generic polymorphism fields detected';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_status_history_booking_id') THEN RAISE EXCEPTION 'fk_booking_status_history_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_status_history_changed_by_admin_user_id') THEN RAISE EXCEPTION 'fk_booking_status_history_changed_by_admin_user_id missing'; END IF;

    -- 5. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_booking_status_history_old_status') THEN RAISE EXCEPTION 'ck_booking_status_history_old_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_booking_status_history_new_status') THEN RAISE EXCEPTION 'ck_booking_status_history_new_status missing'; END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_booking_status_history_booking_id') THEN RAISE EXCEPTION 'ix_booking_status_history_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_booking_status_history_changed_at') THEN RAISE EXCEPTION 'ix_booking_status_history_changed_at missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_booking_status_history_new_status') THEN RAISE EXCEPTION 'ix_booking_status_history_new_status missing'; END IF;

    RAISE NOTICE 'booking_status_history table static verification passed successfully.';
END $$;
