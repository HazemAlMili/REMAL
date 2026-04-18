DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        RAISE EXCEPTION 'Table bookings does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, client_id, unit_id, owner_id, assigned_admin_user_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, internal_notes, created_at, updated_at
    FROM bookings LIMIT 1;
    
    -- 3. Verify no payment/refund/tax columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('tax_amount', 'discount_amount', 'payment_status', 'refund_amount')) THEN
        RAISE EXCEPTION 'Leakage of tax/payment/refund fields detected in bookings table';
    END IF;

    -- 4. Verify no deleted_at exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deleted_at') THEN
        RAISE EXCEPTION 'Leakage of deleted_at field detected in bookings table';
    END IF;

    -- 5. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_client_id') THEN RAISE EXCEPTION 'fk_bookings_client_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_unit_id') THEN RAISE EXCEPTION 'fk_bookings_unit_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_owner_id') THEN RAISE EXCEPTION 'fk_bookings_owner_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_assigned_admin_user_id') THEN RAISE EXCEPTION 'fk_bookings_assigned_admin_user_id missing'; END IF;

    -- 6. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_status') THEN RAISE EXCEPTION 'ck_bookings_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_source') THEN RAISE EXCEPTION 'ck_bookings_source missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_valid_stay_range') THEN RAISE EXCEPTION 'ck_bookings_valid_stay_range missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_guest_count_positive') THEN RAISE EXCEPTION 'ck_bookings_guest_count_positive missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_base_amount_non_negative') THEN RAISE EXCEPTION 'ck_bookings_base_amount_non_negative missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_final_amount_non_negative') THEN RAISE EXCEPTION 'ck_bookings_final_amount_non_negative missing'; END IF;

    -- 7. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_client_id') THEN RAISE EXCEPTION 'ix_bookings_client_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_unit_id') THEN RAISE EXCEPTION 'ix_bookings_unit_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_owner_id') THEN RAISE EXCEPTION 'ix_bookings_owner_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_assigned_admin_user_id') THEN RAISE EXCEPTION 'ix_bookings_assigned_admin_user_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_status') THEN RAISE EXCEPTION 'ix_bookings_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_check_in_date') THEN RAISE EXCEPTION 'ix_bookings_check_in_date missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_bookings_check_out_date') THEN RAISE EXCEPTION 'ix_bookings_check_out_date missing'; END IF;

    RAISE NOTICE 'Bookings table static verification passed successfully.';
END $$;
